// CJS stub for betterAuth.ts — loaded by Jest instead of the real module because
// better-auth and its plugins are ESM-only (.mjs) and cannot be required by ts-jest.
//
// Only auth.api.getSession is called at test time (via auth.ts → getCurrentUser).

import { BaSession } from "../../src/entities/BaSession";
import { User } from "../../src/entities/User";

function extractToken(cookieHeader: string): string | null {
  const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
  if (!match) return null;
  const raw = decodeURIComponent(match[1]);
  const dot = raw.lastIndexOf(".");
  return dot === -1 ? null : raw.slice(0, dot);
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

        const token = extractToken(cookie);
        if (!token) return null;

        const session = await BaSession.findOne({ where: { token } });
        if (!session || session.expiresAt < new Date()) return null;

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
