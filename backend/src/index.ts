import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import db from "./db";
import env from "./env";
import AdResolver from "./resolvers/AdResolver";
import CategoryResolver from "./resolvers/CategoryResolver";
import TagResolver from "./resolvers/TagResolver";

buildSchema({ resolvers: [AdResolver, CategoryResolver, TagResolver] }).then(
  (schema) => {
    const server = new ApolloServer({ schema });
    startStandaloneServer(server, {
      listen: { port: env.GRAPHQL_SERVER_PORT },
    }).then(async ({ url }) => {
      await db.initialize();
      console.log(`GraphQL server ready on ${url}`);
    });
  },
);
