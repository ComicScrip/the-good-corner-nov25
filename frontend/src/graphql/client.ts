import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const uri = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;

console.log({ uri });

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: uri || "/graphql" }),
});

export default client;
