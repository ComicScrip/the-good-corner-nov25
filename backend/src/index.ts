import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import db from "./db";
import env from "./env";
import AdResolver from "./resolvers/AdResolver";
import CategoryResolver from "./resolvers/CategoryResolver";
import TagResolver from "./resolvers/TagResolver";

async function start() {
  await db.initialize();
  const schema = await buildSchema({
    resolvers: [AdResolver, CategoryResolver, TagResolver],
  });
  const server = new ApolloServer({ schema });
  const { url } = await startStandaloneServer(server, {
    listen: { port: env.GRAPHQL_SERVER_PORT },
  });
  console.log(`graphql server ready on ${url}`);
}

start();
