import { createHmac, randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { load } from "ts-dotenv";
import type { Page } from "@playwright/test";
import { User, Role, UserRole } from "../../../backend/src/entities/User";
import { BaSession } from "../../../backend/src/entities/BaSession";

const env = load({
  BETTER_AUTH_SECRET: String,
  BASE_URL: { type: String, optional: true },
});

type LoginUserInput = {
  email: string;
  /** No longer used — the session cookie is forged directly without a password. */
  password?: string;
  role?: Role;
};

/**
 * Build a stateless HS256 JWT that matches what better-auth's `jwt` cookie
 * cache strategy produces (`better-auth.session_data`).
 *
 * Must use `jose`'s SignJWT because better-auth's verifyJWT uses `jose`'s
 * jwtVerify — both encode the secret with TextEncoder and use Web Crypto.
 *
 * Payload shape (from better-auth cookies/index.mjs setCookieCache):
 *   { session: {...}, user: {...}, updatedAt: number, version: string }
 */
async function buildSessionDataJWT(
  user: User,
  sessionId: string,
  token: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = 7 * 24 * 60 * 60; // 7 days

  const payload = {
    session: {
      id: sessionId,
      userId: user.id,
      token,
      expiresAt: new Date((now + maxAge) * 1000).toISOString(),
      createdAt: new Date(now * 1000).toISOString(),
      updatedAt: new Date(now * 1000).toISOString(),
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      emailVerified: user.emailVerified,
      image: user.image ?? null,
      createdAt:
        user.createdAt?.toISOString() ?? new Date(now * 1000).toISOString(),
      updatedAt:
        user.updatedAt?.toISOString() ?? new Date(now * 1000).toISOString(),
      role: user.role,
    },
    updatedAt: Date.now(),
    version: "1",
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(now + maxAge)
    .sign(new TextEncoder().encode(env.BETTER_AUTH_SECRET));
}

/**
 * Build a signed session token cookie value matching better-call's
 * `signCookieValue(token, secret)`:
 *   encodeURIComponent(`${token}.${base64(HMAC-SHA256(token, secret))}`)
 *
 * better-call uses Web Crypto HMAC-SHA256 — Node's createHmac produces the
 * same bytes. The signature is standard base64 (not base64url) with padding.
 */
function buildSignedSessionToken(token: string): string {
  const sig = createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(token)
    .digest("base64"); // standard base64 with padding — must be 44 chars, ends with "="
  return encodeURIComponent(`${token}.${sig}`);
}

/**
 * Create a user in the database, create a real session record, and inject
 * valid better-auth session cookies into the Playwright page context —
 * no HTTP login flow required.
 *
 * - `better-auth.session_token`: signed cookie (required by getSession before
 *   it even checks the cache)
 * - `better-auth.session_data`: JWT cookie cache (avoids a DB lookup per
 *   request when the cache hit succeeds)
 */
export async function loginAs(page: Page, { email, role }: LoginUserInput) {
  const user = await User.create({
    id: randomUUID(),
    email,
    role: role ?? UserRole.Visitor,
    emailVerified: true,
    name: null,
    image: null,
  }).save();

  const now = new Date();
  const sessionId = randomUUID();
  const token = randomUUID();

  // Create a real session record so better-auth can fall back to DB lookups
  // if the JWT cache is somehow rejected.
  await BaSession.create({
    id: sessionId,
    userId: user.id,
    token,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  }).save();

  const jwt = await buildSessionDataJWT(user, sessionId, token);
  const signedToken = buildSignedSessionToken(token);

  const baseUrl = env.BASE_URL ?? "http://localhost:3000";
  const cookieDomain = new URL(baseUrl).hostname;

  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: signedToken,
      domain: cookieDomain,
      path: "/",
    },
    {
      name: "better-auth.session_data",
      value: jwt,
      domain: cookieDomain,
      path: "/",
    },
  ]);

  return user;
}
