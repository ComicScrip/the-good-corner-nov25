// Manual mock for betterAuth — used by Jest (CJS) to avoid importing
// better-auth's ESM bundles, which Jest cannot parse without extra config.

export const auth = {
  handler: async (_req: unknown) => new Response(null, { status: 404 }),
  api: {
    getSession: async (_opts: { headers: unknown }) => null,
  },
  options: {
    plugins: [
      {
        id: "passkey",
        endpoints: {},
      },
    ],
  },
};
