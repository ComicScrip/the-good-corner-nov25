import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import { startSession } from "./auth";
import { auth } from "./betterAuth";
import db from "./db";
import { BaSession } from "./entities/BaSession";
import { BaUser } from "./entities/BaUser";
import { User } from "./entities/User";
import env from "./env";

export async function initFastify() {
  const fastify = Fastify();
  const origin = env.CORS_ALLOWED_ORIGINS.split(",");
  await fastify.register(fastifyCors, { origin, credentials: true });
  await fastify.register(fastifyCookie);

  // Mount better-auth REST routes at /api/auth/*
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (request, reply) => {
      // Convert Fastify request/reply to a Web API Request/Response
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

      // Forward status + headers back to Fastify.
      // IMPORTANT: use getSetCookie() for Set-Cookie headers — Headers.forEach
      // combines multiple Set-Cookie values into a single comma-separated string,
      // which breaks cookie parsing in the browser.
      reply.status(webResponse.status);
      webResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") return; // handled separately below
        reply.header(key, value);
      });
      const cookies = webResponse.headers.getSetCookie?.() ?? [];
      console.log(`[auth proxy] ${request.method} ${request.url} → ${webResponse.status}, set-cookie count: ${cookies.length}`);
      for (const cookie of cookies) {
        console.log(`[auth proxy] set-cookie: ${cookie.substring(0, 80)}...`);
        reply.header("set-cookie", cookie);
      }
      const body = await webResponse.text();
      return reply.send(body);
    },
  });

  /**
   * Bridge route: called after the OAuth provider redirects back to the backend.
   * At this point the better-auth session cookie is present on this same origin
   * (localhost:4000), so we can read it directly — no cross-origin issues.
   *
   * Flow:
   *   GitHub/Google → GET /api/auth/callback/:provider (better-auth sets session
   *   cookie and redirects here) → GET /api/auth-bridge → reads session, issues
   *   JWT cookie, redirects browser to frontend.
   */
  fastify.get("/api/auth-bridge", async (request, reply) => {
    // Extract the session token from the cookie header.
    // better-auth signs cookie values as `token.base64sig` and URL-encodes the
    // whole thing (e.g. + → %2B, = → %3D) before writing to Set-Cookie.
    // The browser stores and retransmits verbatim, so we must URL-decode first,
    // then strip the HMAC signature to get the raw session token.
    const rawCookie = request.headers["cookie"] ?? "";
    const cookieMap = new Map(
      rawCookie.split(";").map((part) => {
        const eq = part.indexOf("=");
        const name = part.slice(0, eq).trim();
        const val = decodeURIComponent(part.slice(eq + 1).trim());
        return [name, val] as [string, string];
      })
    );

    const signedToken = cookieMap.get("better-auth.session_token") ?? "";
    // Strip the `.signature` suffix to get the bare token stored in the DB
    const lastDot = signedToken.lastIndexOf(".");
    const sessionToken = lastDot > 0 ? signedToken.substring(0, lastDot) : signedToken;

    console.log("[auth-bridge] sessionToken:", sessionToken || "(none)");

    if (!sessionToken) {
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Look up the session directly using our TypeORM entities — bypassing the
    // broken @hedystia/better-auth-typeorm adapter which silently drops JOIN.
    const baSession = await db
      .getRepository(BaSession)
      .findOne({ where: { token: sessionToken } });

    console.log("[auth-bridge] baSession:", baSession ? `expires=${baSession.expiresAt}` : "null");

    if (!baSession || baSession.expiresAt < new Date()) {
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const baUser = await db
      .getRepository(BaUser)
      .findOne({ where: { id: baSession.userId } });

    console.log("[auth-bridge] baUser email:", baUser?.email ?? "null");

    if (!baUser?.email) {
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Find or create the app User row, then issue our JWT cookie.
    let user = await User.findOne({ where: { email: baUser.email } });
    if (!user) {
      user = User.create({ email: baUser.email, hashedPassword: "" });
      await user.save();
    }

    await startSession({ req: request, res: reply }, user);

    return reply.redirect(env.FRONTEND_URL);
  });

  return fastify;
}
