import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client/react";
import type { AppProps } from "next/app";
import client from "@/graphql/client";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
