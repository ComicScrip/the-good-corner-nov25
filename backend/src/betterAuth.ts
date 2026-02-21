import { passkey } from "@better-auth/passkey";
import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { betterAuth } from "better-auth";
import db from "./db";
import { User } from "./entities/User";
import env from "./env";

/**
 * The @hedystia/better-auth-typeorm adapter silently drops the `join` parameter
 * on `findOne` calls, so `findSession` (called by sessionMiddleware on every
 * passkey/list/register request) always returns null → 401 UNAUTHORIZED.
 *
 * We wrap the adapter so that whenever `findOne` is called for the "session"
 * model WITH a join, we do the two-step lookup ourselves (session row + user
 * row) and return the merged object that better-auth's `findSession` expects:
 *
 *   { id, token, userId, expiresAt, ..., user: { id, email, name, ... } }
 */
function patchedTypeormAdapter(dataSource: typeof db) {
  const base = typeormAdapter(dataSource);

  return (options: Parameters<ReturnType<typeof typeormAdapter>>[0]) => {
    const adapter = base(options);

    const originalFindOne = adapter.findOne.bind(adapter);

    adapter.findOne = async <T>(args: {
      model: string;
      where: import("@better-auth/core/db/adapter").Where[];
      select?: string[];
      join?: import("@better-auth/core/db/adapter").JoinOption;
    }): Promise<T | null> => {
      // Only intercept session + join queries
      if (args.model === "session" && args.join) {
        // Find the session row normally (without join)
        const session = await originalFindOne<T & { userId?: string }>({ ...args, join: undefined });
        if (!session) return null;

        // Manually fetch the user row
        const userId = session.userId;
        if (!userId) return null;

        const user = await User.findOne({ where: { id: userId } });
        if (!user) return null;

        // Return the merged object better-auth expects:
        // { ...sessionFields, user: { ...userFields } }
        return { ...session, user } as T;
      }

      return originalFindOne<T>(args);
    };

    return adapter;
  };
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.CORS_ALLOWED_ORIGINS.split(","),
  database: patchedTypeormAdapter(db),
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [
    passkey({
      rpID: "localhost",
      rpName: "The Good Corner",
      origin: env.FRONTEND_URL,
    }),
  ],
});
