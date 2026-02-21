import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import { createHmac, randomUUID } from "crypto";
import Fastify from "fastify";
import { cookieName, startSession, verifyJWT } from "./auth";
import { auth } from "./betterAuth";
import db from "./db";
import { BaSession } from "./entities/BaSession";
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
      for (const cookie of cookies) {
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

    if (!sessionToken) {
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Look up the session directly using our TypeORM entities — bypassing the
    // broken @hedystia/better-auth-typeorm adapter which silently drops JOIN.
    const baSession = await db
      .getRepository(BaSession)
      .findOne({ where: { token: sessionToken } });

    if (!baSession || baSession.expiresAt < new Date()) {
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const user = await User.findOne({ where: { id: baSession.userId } });

    if (!user) {
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    await startSession({ req: request, res: reply }, user);

    return reply.redirect(env.FRONTEND_URL);
  });

  /**
   * Passkey sign-in bridge: after authClient.signIn.passkey() succeeds,
   * better-auth has set its session cookie but our JWT cookie is still absent.
   * The frontend calls this endpoint (via fetch, credentials:include) so we can
   * read the better-auth session and issue our JWT cookie, then return JSON.
   */
  fastify.get("/api/auth-bridge-passkey", async (request, reply) => {
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
    const lastDot = signedToken.lastIndexOf(".");
    const sessionToken = lastDot > 0 ? signedToken.substring(0, lastDot) : signedToken;

    if (!sessionToken) {
      return reply.status(401).send({ error: "No session" });
    }

    const baSession = await db
      .getRepository(BaSession)
      .findOne({ where: { token: sessionToken } });

    if (!baSession || baSession.expiresAt < new Date()) {
      return reply.status(401).send({ error: "Session not found or expired" });
    }

    const user = await User.findOne({ where: { id: baSession.userId } });
    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    await startSession({ req: request, res: reply }, user);
    return reply.status(200).send({ ok: true });
  });

  /**
   * Ensure the caller has a valid better-auth session cookie.
   *
   * Email/password users are authenticated via our JWT cookie but never get a
   * better-auth session (better-auth only creates sessions for OAuth/passkey
   * sign-ins). The passkey endpoints require a better-auth session, so this
   * route bridges the gap: it reads the JWT, looks up (or creates) a BaSession
   * row, signs the token the same way better-auth does, and sets the
   * `better-auth.session_token` cookie so the passkey endpoints see a session.
   *
   * Called by the frontend before any passkey operation.
   */
  fastify.get("/api/auth-ensure-session", async (request, reply) => {
    // Parse ALL occurrences of the authToken cookie from the raw header.
    // The browser may send multiple cookies with the same name when a stale
    // cookie (e.g. from before a PK migration) coexists with a fresh one.
    // @fastify/cookie only exposes the first occurrence; we need to find the
    // first token whose JWT is valid AND whose userId resolves to a real User.
    const rawCookieHeader = request.headers["cookie"] ?? "";
    const allTokens: string[] = rawCookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part.startsWith(`${cookieName}=`))
      .map((part) => decodeURIComponent(part.slice(cookieName.length + 1)));

    let user: User | null = null;
    for (const token of allTokens) {
      const payload = verifyJWT(token);
      if (!payload) continue;
      const found = await User.findOne({ where: { id: payload.userId } });
      if (found) {
        user = found;
        // Re-issue a clean single authToken cookie so the stale duplicate is
        // overwritten — the browser replaces an existing cookie that has the
        // same name, Path, and Domain.
        await startSession({ req: request, res: reply }, found);
        break;
      }
    }

    if (!user) {
      return reply.status(401).send({ error: "User not found, please log in again" });
    }

    const sessionRepo = db.getRepository(BaSession);

    // Re-use any existing valid session for this user's actual UUID.
    // Only reuse if the session's userId matches the current user.id — guards
    // against stale rows left over from before the PK migration.
    const existing = await sessionRepo.findOne({
      where: { userId: user.id },
      order: { expiresAt: "DESC" },
    });

    let sessionToken: string;

    if (existing && existing.expiresAt > new Date()) {
      sessionToken = existing.token;
    } else {
      // Create a new better-auth session row directly.
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const session = sessionRepo.create({
        id: randomUUID(),
        token: randomUUID(),
        userId: user.id,
        expiresAt,
        ipAddress: request.ip ?? null,
        userAgent: request.headers["user-agent"] ?? null,
        createdAt: now,
        updatedAt: now,
      });
      await sessionRepo.save(session);
      sessionToken = session.token;
    }

    // Sign the token exactly as better-call's signCookieValue does:
    //   signature = btoa(String.fromCharCode(...HMAC-SHA256 bytes)) → standard base64
    //   cookie value = encodeURIComponent(token + "." + signature)
    // better-call verifies by: atob(sig) → raw bytes → WebCrypto verify
    // and rejects if signature.length !== 44 or !signature.endsWith("=")
    const sig = createHmac("sha256", env.BETTER_AUTH_SECRET)
      .update(sessionToken)
      .digest("base64"); // standard base64: 44 chars, ends with "="
    const signedValue = encodeURIComponent(`${sessionToken}.${sig}`);

    // Set the cookie on the backend origin (localhost:4000) — same origin as
    // all /api/auth/* endpoints, so the browser will send it automatically.
    const isProduction = env.NODE_ENV === "production";
    reply.header(
      "set-cookie",
      `better-auth.session_token=${signedValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${isProduction ? "; Secure" : ""}`,
    );

    return reply.status(200).send({ ok: true });
  });

  return fastify;
}
