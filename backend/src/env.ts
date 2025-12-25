import { load } from "ts-dotenv";

export default load({
  GRAPHQL_SERVER_PORT: Number,
  JWT_SECRET: String,
  COOKIE_SECRET: String,
  CORS_ALLOWED_ORIGINS: String,
});
