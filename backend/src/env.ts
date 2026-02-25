import { load } from "ts-dotenv";

export default load({
  GRAPHQL_SERVER_PORT: Number,
  BETTER_AUTH_SECRET: String,
  BETTER_AUTH_URL: String,
  FRONTEND_URL: String,
  CORS_ALLOWED_ORIGINS: String,
  NODE_ENV: ["development" as const, "production" as const, "test" as const],
  DB_HOST: String,
  DB_PORT: Number,
  DB_USER: String,
  DB_PASS: String,
  DB_NAME: String,
  TEST_DB_PORT: {
    type: Number,
    optional: true,
  },
  GOOGLE_CLIENT_ID: {
    type: String,
    optional: true,
  },
  GOOGLE_CLIENT_SECRET: {
    type: String,
    optional: true,
  },
  GITHUB_CLIENT_ID: {
    type: String,
    optional: true,
  },
  GITHUB_CLIENT_SECRET: {
    type: String,
    optional: true,
  },
  MAILJET_SMTP_USER: {
    type: String,
    optional: true,
  },
  MAILJET_SMTP_PASS: {
    type: String,
    optional: true,
  },
  MAILJET_FROM_EMAIL: {
    type: String,
    optional: true,
  },
  MAILJET_SMTP_HOST: {
    type: String,
    optional: true,
  },
  MAILJET_SMTP_PORT: {
    type: Number,
    optional: true,
  },
});
