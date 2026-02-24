import { DataSource } from "typeorm";
import { Ad } from "../entities/Ad";
import { BaAccount } from "../entities/BaAccount";
import { BaPasskey } from "../entities/BaPasskey";
import { BaSession } from "../entities/BaSession";
import { BaVerification } from "../entities/BaVerification";
import { Category } from "../entities/Category";
import { Tag } from "../entities/Tag";
import { User } from "../entities/User";
import env from "../env";

const db = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  username: env.DB_USER,
  password: env.DB_PASS,
  port: env.NODE_ENV === "test" ? env.TEST_DB_PORT : env.DB_PORT,
  database: env.DB_NAME,
  entities: [
    Ad,
    Tag,
    Category,
    User,
    BaSession,
    BaAccount,
    BaVerification,
    BaPasskey,
  ],
  migrations: [`${__dirname}/migrations/**/*{.js,.ts}`],
  migrationsRun: true,
});

export async function clearDB() {
  const runner = db.createQueryRunner();
  const tableDroppings = db.entityMetadatas.map((entity) =>
    runner.query(`DROP TABLE IF EXISTS "${entity.tableName}" CASCADE`),
  );
  await Promise.all(tableDroppings);
  await runner.release();
  await db.synchronize();
}

export default db;
