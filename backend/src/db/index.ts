import { DataSource } from "typeorm";
import { Ad } from "../entities/Ad";
import { Category } from "../entities/Category";
import { Tag } from "../entities/Tag";
import { User } from "../entities/User";
import env from "../env";

export default new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  username: env.DB_USER,
  password: env.DB_PASS,
  port: env.DB_PORT,
  database: env.DB_NAME,
  entities: [User, Category, Ad, Tag],
  synchronize: true,
  //logging: true
});
