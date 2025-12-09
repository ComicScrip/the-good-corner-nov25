import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4001",
  documents: ["**/*.{gql,graphql}"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/graphql/generated/schema.ts": {
      // see https://github.com/dotansimha/graphql-code-generator/issues/5073
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo", { "add": { content: '// @ts-nocheck' } }],

    },
  },
  // see https://github.com/dotansimha/graphql-code-generator-community/issues/1216
  config: {
    apolloReactCommonImportFrom: "@apollo/client/react",
    apolloReactHooksImportFrom: "@apollo/client/react",
  }
};

export default config;
