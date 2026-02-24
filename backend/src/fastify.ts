import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import { injectBetterAuthRoutes } from "./betterAuth";
import env from "./env";

export async function initFastify() {
  const fastify = Fastify();
  const origin = env.CORS_ALLOWED_ORIGINS.split(",");
  await fastify.register(fastifyCors, { origin, credentials: true });
  await fastify.register(fastifyCookie);
  injectBetterAuthRoutes(fastify);
  return fastify;
}
