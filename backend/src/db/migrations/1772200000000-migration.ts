import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772200000000 implements MigrationInterface {
  name = "Migration1772200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add sold column to ad table
    await queryRunner.query(
      `ALTER TABLE "ad" ADD COLUMN IF NOT EXISTS "sold" boolean NOT NULL DEFAULT false`,
    );

    // Create purchase table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "purchase" (
        "id" SERIAL NOT NULL,
        "stripeSessionId" text NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "adId" integer,
        "buyerId" text,
        CONSTRAINT "PK_purchase" PRIMARY KEY ("id"),
        CONSTRAINT "FK_purchase_ad" FOREIGN KEY ("adId") REFERENCES "ad"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_purchase_buyer" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase"`);
    await queryRunner.query(`ALTER TABLE "ad" DROP COLUMN IF EXISTS "sold"`);
  }
}
