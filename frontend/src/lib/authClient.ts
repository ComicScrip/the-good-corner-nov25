import { passkeyClient } from "@better-auth/passkey/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;

export const authClient = createAuthClient({
  baseURL,
  plugins: [passkeyClient(), magicLinkClient()],
});
