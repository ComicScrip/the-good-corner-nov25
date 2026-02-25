import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772000000000 implements MigrationInterface {
  name = "Migration1772000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The session table is no longer needed: better-auth now uses stateless
    // JWT cookie caching. Sessions are encoded in signed cookies and verified
    // locally — no database read is required per request.
    // The table is managed by better-auth's pg adapter (not TypeORM), so
    // dropping it here keeps the TypeORM schema in sync with reality.
    await queryRunner.query(`DROP TABLE IF EXISTS "session"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "session" ("id" text NOT NULL, "userId" text NOT NULL, "token" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "ipAddress" text, "userAgent" text, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_232f8e85d7633bd6ddfad421696" UNIQUE ("token"), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
  }
}
