import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const uri = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "/graphql";

console.log({ uri });

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri,
    credentials: "include", // Important: Include cookies with requests
  }),
});

export default client;
