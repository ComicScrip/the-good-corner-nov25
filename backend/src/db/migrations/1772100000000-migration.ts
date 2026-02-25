import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772100000000 implements MigrationInterface {
  name = "Migration1772100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Re-create the session table. better-auth with a primary `database` set
    // always writes new sessions here on sign-in (cookieCache is a read cache,
    // not a replacement for the session store).
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "session" ("id" text NOT NULL, "userId" text NOT NULL, "token" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "ipAddress" text, "userAgent" text, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_232f8e85d7633bd6ddfad421696" UNIQUE ("token"), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "session"`);
  }
}
