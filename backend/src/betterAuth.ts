import { passkey } from "@better-auth/passkey";
import { hash as argon2Hash, verify as argon2Verify } from "argon2";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import type { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { changeEmailEmail } from "./emails/changeEmail";
import { magicLinkEmail } from "./emails/magicLink";
import { resetPasswordEmail } from "./emails/resetPassword";
import { verifyEmailEmail } from "./emails/verifyEmail";
import env from "./env";
import { sendMail } from "./mailer";
import redis from "./redis";

// ---------------------------------------------------------------------------
// Dragonfly / Redis secondary storage
// When REDIS_URL is set, better-auth stores sessions in Dragonfly
// (Redis-compatible) instead of Postgres, enabling fast O(1) session lookups
// and instant revocability. The cookie cache still applies on top, so a
// Redis round-trip is only needed when the 5-minute JWT cache expires.
//
// The same Dragonfly instance is also used by TypeORM for query result
// caching (see src/db/index.ts). Both share the same ioredis singleton
// (see src/redis.ts) so only one TCP connection is opened.
// ---------------------------------------------------------------------------

const secondaryStorage = redis
  ? (() => {
      const r = redis; // non-null alias so TypeScript narrows correctly in closures
      return {
        get: (key: string) => r.get(key),
        set: (key: string, value: string, ttl?: number) =>
          ttl
            ? r.set(key, value, "EX", ttl).then(() => {})
            : r.set(key, value).then(() => {}),
        delete: (key: string) => r.del(key).then(() => {}),
      };
    })()
  : undefined;

// Standard pg Pool — better-auth uses this directly via its built-in Kysely
// PostgreSQL adapter. No custom adapter wrapper needed.
const pool = new Pool({
  host: env.DB_HOST,
  port:
    env.NODE_ENV === "test" ? (env.TEST_DB_PORT ?? env.DB_PORT) : env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
});

export function injectBetterAuthRoutes(fastify: FastifyInstance) {
  // Mount all better-auth REST routes at /api/auth/*
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (request, reply) => {
      const url = `${env.BETTER_AUTH_URL}${request.url}`;

      const webRequest = new Request(url, {
        method: request.method,
        headers: request.headers as Record<string, string>,
        body:
          request.method !== "GET" && request.method !== "HEAD"
            ? JSON.stringify(request.body)
            : undefined,
      });

      const webResponse = await auth.handler(webRequest);

      reply.status(webResponse.status);
      webResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") return;
        reply.header(key, value);
      });
      const cookies = webResponse.headers.getSetCookie?.() ?? [];
      for (const cookie of cookies) {
        reply.header("set-cookie", cookie);
      }
      const body = await webResponse.text();
      return reply.send(body);
    },
  });
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.CORS_ALLOWED_ORIGINS.split(","),
  database: pool,
  secondaryStorage,
  session: {
    // Cookie cache: session data is encoded in a signed JWT cookie so the DB
    // (or Redis) is not queried on every request. Refreshed automatically
    // when the 5-min cache expires. When REDIS_URL is set, better-auth
    // reads/writes sessions from Redis/Dragonfly for O(1) lookups and instant
    // revocability; otherwise it falls back to the Postgres `session` table.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5-minute cache: avoids a storage round-trip per request
      strategy: "jwt",
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      hash: (password: string) => argon2Hash(password),
      verify: ({ hash, password }: { hash: string; password: string }) =>
        argon2Verify(hash, password),
    },
    sendResetPassword: async ({ user, url }) => {
      const displayName = user.name ?? (user.email ?? "").split("@")[0];
      await sendMail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: resetPasswordEmail(displayName, url),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      // better-auth builds url as ${baseURL}/api/auth/verify-email?token=...
      // but the verification page lives on the frontend at ${FRONTEND_URL}/auth/verify-email?token=...
      const frontendUrl = url.replace(
        `${env.BETTER_AUTH_URL}/api/auth`,
        `${env.FRONTEND_URL}/auth`,
      );
      const displayName = user.name ?? (user.email ?? "").split("@")[0];
      await sendMail({
        to: user.email,
        subject: "Vérifiez votre adresse email",
        html: verifyEmailEmail(displayName, frontendUrl),
      });
    },
    autoSignInAfterVerification: true,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        const fixedUrl = url.replace(
          /([?&]callbackURL=)(.+)$/,
          (_, prefix, value) => `${prefix}${encodeURIComponent(value)}`,
        );
        const frontendUrl = fixedUrl.replace(
          `${env.BETTER_AUTH_URL}/api/auth`,
          `${env.FRONTEND_URL}/auth`,
        );
        const displayName = user.name ?? (user.email ?? "").split("@")[0];
        await sendMail({
          to: user.email ?? newEmail,
          subject: "Confirmation de changement d'email",
          html: changeEmailEmail(displayName, newEmail, frontendUrl),
        });
      },
    },
  },
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
      rpID: new URL(env.FRONTEND_URL).hostname,
      rpName: "The Good Corner",
      origin: env.FRONTEND_URL,
    }),
    magicLink({
      expiresIn: 600, // 10 minutes
      disableSignUp: false,
      sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
        // better-auth builds url as ${baseURL}/api/auth/magic-link/verify?token=...
        // Rewrite to the frontend page that will call the verify endpoint.
        const frontendUrl = url.replace(
          `${env.BETTER_AUTH_URL}/api/auth`,
          `${env.FRONTEND_URL}/auth`,
        );
        const displayName = email.split("@")[0];
        await sendMail({
          to: email,
          subject: "Votre lien de connexion",
          html: magicLinkEmail(displayName, frontendUrl),
        });
      },
    }),
  ],
});
