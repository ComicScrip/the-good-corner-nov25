import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import {
  fastifyApolloDrainPlugin,
  fastifyApolloHandler,
} from "@as-integrations/fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import { buildSchema } from "type-graphql";
import { getUserFromToken, startSession } from "./auth";
import db from "./db";
import env from "./env";
import AdResolver from "./resolvers/AdResolver";
import CategoryResolver from "./resolvers/CategoryResolver";
import TagResolver from "./resolvers/TagResolver";
import UserResolver from "./resolvers/UserResolver";
import type { GraphQLContext } from "./types";

async function start() {
  await db.initialize();

  const schema = await buildSchema({
    resolvers: [AdResolver, CategoryResolver, TagResolver, UserResolver],
  });

  const fastify = Fastify();
  const origin = env.CORS_ALLOWED_ORIGINS.split(",");
  await fastify.register(fastifyCors, { origin, credentials: true });
  await fastify.register(fastifyCookie, { secret: env.COOKIE_SECRET });

  const apollo = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [fastifyApolloDrainPlugin(fastify)],
  });

  await apollo.start();

  fastify.route({
    url: "/",
    method: ["POST", "GET", "OPTIONS"],
    handler: fastifyApolloHandler(apollo, {
      context: async (req, res) => {
        const authToken = req.cookies?.authToken;
        const user = authToken ? await getUserFromToken(authToken) : null;
        return { user, res, req, startSession };
      },
    }),
  });

  const url = await fastify.listen({ port: env.GRAPHQL_SERVER_PORT });
  console.log({ url });
}

start().catch(console.error);
