import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771954038010 implements MigrationInterface {
  name = "Migration1771954038010";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "account" ("id" text NOT NULL, "userId" text NOT NULL, "accountId" text NOT NULL, "providerId" text NOT NULL, "accessToken" text, "refreshToken" text, "accessTokenExpiresAt" TIMESTAMP, "refreshTokenExpiresAt" TIMESTAMP, "scope" text, "idToken" text, "password" text, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "passkey" ("id" text NOT NULL, "name" text, "publicKey" text NOT NULL, "userId" text NOT NULL, "credentialID" text NOT NULL, "counter" bigint NOT NULL, "deviceType" text NOT NULL, "backedUp" boolean NOT NULL, "transports" text, "createdAt" TIMESTAMP, "aaguid" text, CONSTRAINT "PK_783e2060d8025abd6a6ca45d2c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c36f303905314ea9ead857b626" ON "passkey" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13f3b6917997b9021284813805" ON "passkey" ("credentialID") `,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" text NOT NULL, "userId" text NOT NULL, "token" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "ipAddress" text, "userAgent" text, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_232f8e85d7633bd6ddfad421696" UNIQUE ("token"), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "verification" ("id" text NOT NULL, "identifier" text NOT NULL, "value" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP, CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "image"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "image" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "image"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "image" character varying`);
    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_13f3b6917997b9021284813805"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c36f303905314ea9ead857b626"`,
    );
    await queryRunner.query(`DROP TABLE "passkey"`);
    await queryRunner.query(`DROP TABLE "account"`);
  }
}
