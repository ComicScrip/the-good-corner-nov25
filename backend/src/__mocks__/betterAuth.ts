// Manual mock for betterAuth — used by Jest (CJS) to avoid importing
// better-auth's ESM bundles, which Jest cannot parse without extra config.

import { createHmac } from "crypto";
import { BaSession } from "../entities/BaSession";
import { User } from "../entities/User";

function parseCookieToken(cookieHeader: string): string | null {
  const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
  if (!match) return null;
  const raw = decodeURIComponent(match[1]);
  // Format: <token>.<sig>
  const dotIdx = raw.lastIndexOf(".");
  if (dotIdx === -1) return null;
  return raw.substring(0, dotIdx);
}

export const auth = {
  handler: async (_req: unknown) => new Response(null, { status: 404 }),
  api: {
    getSession: async (opts: {
      headers: { get?: (key: string) => string | null; [key: string]: unknown };
    }) => {
      try {
        // Extract cookie header from Headers-like object or plain object
        const cookieHeader =
          typeof opts.headers.get === "function"
            ? (opts.headers.get("cookie") ?? "")
            : ((opts.headers["cookie"] as string | undefined) ?? "");

        const token = parseCookieToken(cookieHeader);
        if (!token) return null;

        // Look up the session in the DB
        const session = await BaSession.findOne({ where: { token } });
        if (!session || session.expiresAt < new Date()) return null;

        const user = await User.findOne({ where: { id: session.userId } });
        if (!user) return null;

        return {
          session: {
            id: session.id,
            token: session.token,
            userId: session.userId,
            expiresAt: session.expiresAt,
          },
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
          },
        };
      } catch {
        return null;
      }
    },
    sendVerificationEmail: async (_opts: unknown) => {},
  },
  options: {
    plugins: [
      {
        id: "passkey",
        endpoints: {},
      },
      {
        id: "magic-link",
        endpoints: {},
      },
    ],
  },
};

export function injectBetterAuthRoutes(_fastify: unknown) {
  // no-op in tests — we don't need actual auth routes
}
