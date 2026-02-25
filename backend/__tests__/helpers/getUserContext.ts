import { createHmac, randomUUID } from "node:crypto";
import type { User } from "../../src/entities/User";
import env from "../../src/env";

// Build a minimal HS256 JWT that matches what better-auth's `signJWT` (via jose)
// produces for the `jwt` cookie cache strategy.
// Payload shape: { session: {...}, user: {...}, updatedAt, iat, exp }
// Cookie name:   better-auth.session_data
function buildSessionDataJWT(user: User): string {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = 7 * 24 * 60 * 60; // 7 days — matches betterAuth.ts cookieCache.maxAge

  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");

  const payload = Buffer.from(
    JSON.stringify({
      session: {
        id: randomUUID(),
        userId: user.id,
        token: randomUUID(),
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
      iat: now,
      exp: now + maxAge,
    }),
  ).toString("base64url");

  const sig = createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${sig}`;
}

/**
 * Return a GraphQL context whose request carries a stateless session cookie
 * for `user`. No database write is needed — the session is fully encoded in
 * the signed JWT cookie, matching the `jwt` cookie cache strategy.
 */
export function getUserContext(user: User) {
  const jwt = buildSessionDataJWT(user);
  const cookieValue = encodeURIComponent(jwt);

  return {
    req: {
      headers: {
        cookie: `better-auth.session_data=${cookieValue}`,
      },
    },
  };
}
