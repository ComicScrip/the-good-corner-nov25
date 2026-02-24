import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771946157176 implements MigrationInterface {
  name = "Migration1771946157176";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop hashedPassword (no longer needed — better-auth manages passwords in account.password)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "hashedPassword"`);

    // Rename avatar → image (better-auth convention)
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "avatar" TO "image"`);

    // Make image nullable (OAuth users have one, email users don't)
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "image" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "image" SET DEFAULT NULL`);
    // Clear the old default avatar URL — now null for plain email users
    await queryRunner.query(`UPDATE "user" SET "image" = NULL WHERE "image" LIKE 'https://media.istockphoto.com%' OR "image" LIKE 'https://c1.alamy.com%'`);

    // Add name column (nullable — better-auth populates for OAuth users)
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "name" text DEFAULT NULL`);

    // Add emailVerified column (better-auth sets this on email verification)
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "emailVerified" boolean NOT NULL DEFAULT false`);

    // Add updatedAt column (better-auth updates this)
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);

    // Change id column from integer SERIAL to text (better-auth uses UUID strings)
    // Only do this if the id column is still integer type.
    // We check by looking at the column type before altering.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF (SELECT data_type FROM information_schema.columns
            WHERE table_name = 'user' AND column_name = 'id') = 'integer' THEN
          -- Drop FK constraints that reference user.id
          ALTER TABLE "ad" DROP CONSTRAINT IF EXISTS "FK_ee93b44ac1911e95b7026881c28";
          -- Drop primary key
          ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "PK_cace4a159ff9f2512dd42373760";
          -- Change id to text
          ALTER TABLE "user" ALTER COLUMN "id" TYPE text USING id::text;
          -- Drop the sequence default
          ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;
          -- Re-add primary key
          ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id");
          -- Change ad.authorId to text and re-add FK
          ALTER TABLE "ad" ALTER COLUMN "authorId" TYPE text USING "authorId"::text;
          ALTER TABLE "ad" ADD CONSTRAINT "FK_ee93b44ac1911e95b7026881c28"
            FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "hashedPassword" character varying NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "image" TO "avatar"`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatar" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "emailVerified"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "updatedAt"`);
  }
}
