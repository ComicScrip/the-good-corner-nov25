import { DataSource } from "typeorm";
import env from "../env";

const db = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  username: env.DB_USER,
  password: env.DB_PASS,
  port: env.NODE_ENV === 'test' ? env.TEST_DB_PORT : env.DB_PORT,
  database: env.DB_NAME,
  entities: ["src/entities/*.ts"],
  synchronize: true
  //logging: true
});

export async function clearDB() {
  const runner = db.createQueryRunner()
  const tableDroppings = db.entityMetadatas.map(entity => runner.query(`DROP TABLE IF EXISTS "${entity.tableName}" CASCADE`))
  await Promise.all(tableDroppings)
  await db.synchronize()
}

export default db