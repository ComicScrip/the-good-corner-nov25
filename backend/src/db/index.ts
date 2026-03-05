import { DataSource } from "typeorm";
import { Ad } from "../entities/Ad";
import { BaAccount } from "../entities/BaAccount";
import { BaPasskey } from "../entities/BaPasskey";
import { BaSession } from "../entities/BaSession";
import { BaVerification } from "../entities/BaVerification";
import { Category } from "../entities/Category";
import { Purchase } from "../entities/Purchase";
import { Tag } from "../entities/Tag";
import { User } from "../entities/User";
import env from "../env";
import redis from "../redis";

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
    Purchase,
    BaAccount,
    BaVerification,
    BaPasskey,
    BaSession,
  ],
  migrations: [`${__dirname}/migrations/**/*{.js,.ts}`],
  migrationsRun: true,
  // Disable query-result caching in test mode so that e2e tests always see
  // the current DB state after clearDB() runs between test cases.
  ...(env.REDIS_URL && env.NODE_ENV !== "test"
    ? {
        cache: {
          type: "ioredis" as const,
          options: env.REDIS_URL,
          duration: 60_000, // default TTL: 60 s (overridable per-query)
          ignoreErrors: true,
        },
      }
    : {}),
});

/**
 * Removes the given named cache keys from the TypeORM query result cache.
 * No-ops gracefully when the cache is not configured (REDIS_URL unset).
 */
export async function invalidateCache(keys: string[]): Promise<void> {
  await db.queryResultCache?.remove(keys);
}

/**
 * Scans Dragonfly/Redis for all keys matching `pattern` and deletes them in
 * one pipeline. Uses the non-blocking SCAN iterator rather than KEYS so it
 * is safe against large keyspaces.
 *
 * No-ops when REDIS_URL is not set (redis is null).
 */
async function scanDeletePattern(pattern: string): Promise<void> {
  if (!redis) return;
  const keys: string[] = [];
  let cursor = "0";
  do {
    const [nextCursor, batch] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );
    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== "0");

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * Instantly invalidates every cached variant of the `ads` query
 * (e.g. `ads:5:camera:10:createdAt:desc`) by scanning for `ads:*` keys and
 * deleting them, then also removes the bare `"ads"` key used by the TypeORM
 * query result cache layer.
 *
 * Falls back gracefully to TypeORM-only invalidation when REDIS_URL is unset.
 */
export async function invalidateAdsCache(): Promise<void> {
  await Promise.all([scanDeletePattern("ads:*"), invalidateCache(["ads"])]);
}

export async function clearDB() {
  // Flush Redis so stale cached query results don't bleed across tests.
  if (redis) {
    await redis.flushdb();
  }
  await db.queryResultCache?.clear();

  const runner = db.createQueryRunner();
  const tableDroppings = db.entityMetadatas.map((entity) =>
    runner.query(`DROP TABLE IF EXISTS "${entity.tableName}" CASCADE`),
  );
  await Promise.all(tableDroppings);
  await runner.release();
  await db.synchronize();
}

export default db;
