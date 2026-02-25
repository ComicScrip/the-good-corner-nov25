import { passkey } from "@better-auth/passkey";
import { hash as argon2Hash, verify as argon2Verify } from "argon2";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import type { FastifyInstance } from "fastify";
import { Pool } from "pg";
import env from "./env";
import { sendMail } from "./mailer";

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
  session: {
    // Cookie cache: session data is encoded in a signed JWT cookie so the DB
    // is not queried on every request. Refreshed automatically when the 5-min
    // cache expires. The session record still lives in the `session` table and
    // is written by better-auth on sign-in.
    //
    // To add Redis-backed revocability in the future, add a `secondaryStorage`
    // config block (better-auth will then store sessions in Redis instead of
    // the DB, and the cookie cache will validate against Redis).
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5-minute cache: avoids a DB read on every request
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
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string; name: string | null };
      url: string;
    }) => {
      const displayName = user.name ?? user.email.split("@")[0];
      await sendMail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <p>Bonjour ${displayName},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
          <p><a href="${url}">${url}</a></p>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'avez pas effectué cette demande, ignorez cet email.</p>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string | null };
      url: string;
    }) => {
      // better-auth builds url as ${baseURL}/api/auth/verify-email?token=...
      // but the verification page lives on the frontend at ${FRONTEND_URL}/auth/verify-email?token=...
      const frontendUrl = url.replace(
        `${env.BETTER_AUTH_URL}/api/auth`,
        `${env.FRONTEND_URL}/auth`,
      );
      const displayName = user.name ?? user.email.split("@")[0];
      await sendMail({
        to: user.email,
        subject: "Vérifiez votre adresse email",
        html: `
          <p>Bonjour ${displayName},</p>
          <p>Merci de vous être inscrit sur The Good Corner !</p>
          <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
          <p><a href="${frontendUrl}">${frontendUrl}</a></p>
          <p>Ce lien expire dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
        `,
      });
    },
    autoSignInAfterVerification: true,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        newEmail,
        url,
      }: {
        user: { email: string; name: string | null };
        newEmail: string;
        url: string;
      }) => {
        const fixedUrl = url.replace(
          /([?&]callbackURL=)(.+)$/,
          (_, prefix, value) => `${prefix}${encodeURIComponent(value)}`,
        );
        const frontendUrl = fixedUrl.replace(
          `${env.BETTER_AUTH_URL}/api/auth`,
          `${env.FRONTEND_URL}/auth`,
        );
        const displayName = user.name ?? user.email.split("@")[0];
        await sendMail({
          to: user.email,
          subject: "Confirmation de changement d'email",
          html: `
            <p>Bonjour ${displayName},</p>
            <p>Vous avez demandé à changer votre adresse email vers <strong>${newEmail}</strong>.</p>
            <p>Cliquez sur le lien ci-dessous pour confirmer cette demande depuis votre ancienne adresse :</p>
            <p><a href="${frontendUrl}">${frontendUrl}</a></p>
            <p>Ce lien expire dans 24 heures.</p>
            <p>Si vous n'avez pas effectué cette demande, ignorez cet email.</p>
          `,
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
      rpID: "localhost",
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
          html: `
            <p>Bonjour ${displayName},</p>
            <p>Voici votre lien de connexion à The Good Corner :</p>
            <p><a href="${frontendUrl}">${frontendUrl}</a></p>
            <p>Ce lien est valable pendant 10 minutes.</p>
            <p>Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
          `,
        });
      },
    }),
  ],
});
