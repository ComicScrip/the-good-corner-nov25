import { createHmac, randomUUID } from "crypto";
import { BaSession } from "../../src/entities/BaSession";
import type { User } from "../../src/entities/User";
import env from "../../src/env";

/**
 * Create a real better-auth session in the DB for `user` and return a
 * GraphQL context whose request carries the signed session cookie.
 */
export async function getUserContext(user: User) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const token = randomUUID();

  await BaSession.create({
    id: randomUUID(),
    token,
    userId: user.id,
    expiresAt,
    ipAddress: null,
    userAgent: null,
    createdAt: now,
    updatedAt: now,
  }).save();

  // Sign the token exactly as better-auth does (HMAC-SHA256, standard base64)
  const sig = createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(token)
    .digest("base64");
  const cookieValue = encodeURIComponent(`${token}.${sig}`);

  return {
    req: {
      headers: {
        cookie: `better-auth.session_token=${cookieValue}`,
      },
    },
  };
}
