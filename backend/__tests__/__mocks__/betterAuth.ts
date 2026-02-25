// CJS stub for betterAuth.ts — loaded by Jest instead of the real module because
// better-auth and its plugins are ESM-only (.mjs) and cannot be required by ts-jest.
//
// Stateless mode: sessions are encoded as HS256 JWTs in the `better-auth.session_data`
// cookie (strategy: "jwt"). No database lookup is needed for session validation —
// we verify the JWT signature locally and extract the user from the payload.

import { createHmac } from "node:crypto";
import { User } from "../../src/entities/User";
import env from "../../src/env";

// Minimal HS256 JWT verifier using Node's built-in crypto.
// Mirrors what better-auth's signJWT / verifyJWT (via jose) produces.
function verifyHS256JWT(
  token: string,
  secret: string,
): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;

  // Verify signature: HMAC-SHA256 over "header.payload"
  const expected = createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  if (expected !== sigB64) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    );
    // Check expiry (jose puts exp as unix seconds)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function extractSessionDataCookie(cookieHeader: string): string | null {
  // Cookie name in dev (non-https): better-auth.session_data
  const match = cookieHeader.match(/better-auth\.session_data=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const auth = {
  handler: async (_req: unknown) => new Response(null, { status: 404 }),
  api: {
    getSession: async (opts: {
      headers: Headers | Record<string, unknown>;
    }) => {
      try {
        const cookie =
          opts.headers instanceof Headers
            ? (opts.headers.get("cookie") ?? "")
            : ((opts.headers.cookie as string | undefined) ?? "");

        const sessionDataToken = extractSessionDataCookie(cookie);
        if (!sessionDataToken) return null;

        const payload = verifyHS256JWT(
          sessionDataToken,
          env.BETTER_AUTH_SECRET,
        );
        if (!payload) return null;

        const { session } = payload as {
          session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: string;
          };
        };

        if (!session?.userId) return null;

        // Fetch the fresh user from DB (matches real better-auth behavior where
        // the user record is the source of truth for role/email etc.)
        const user = await User.findOne({ where: { id: session.userId } });
        if (!user) return null;

        return { session, user };
      } catch {
        return null;
      }
    },
    sendVerificationEmail: async (_opts: unknown) => {},
  },
  options: {
    plugins: [
      { id: "passkey", endpoints: {} },
      { id: "magic-link", endpoints: {} },
    ],
  },
};

export function injectBetterAuthRoutes(_fastify: unknown) {}
