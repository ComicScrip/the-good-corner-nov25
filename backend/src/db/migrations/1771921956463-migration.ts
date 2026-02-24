import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771921956463 implements MigrationInterface {
  name = "Migration1771921956463";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "hashedPassword" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "role" character varying NOT NULL DEFAULT 'visitor', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ad" ("id" SERIAL NOT NULL, "title" character varying(100) NOT NULL, "price" double precision NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "location" character varying(50) NOT NULL, "pictureUrl" character varying NOT NULL, "categoryId" integer, "authorId" integer, CONSTRAINT "PK_0193d5ef09746e88e9ea92c634d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_ads_ad" ("tagId" integer NOT NULL, "adId" integer NOT NULL, CONSTRAINT "PK_9770ca45fa10ed4f02593be766c" PRIMARY KEY ("tagId", "adId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9af5c0789da7135949e01590d0" ON "tag_ads_ad" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2e21c616c1e011ddc661cab145" ON "tag_ads_ad" ("adId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ad_tags_tag" ("adId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_95b9f8a69d8090f2ec1abeb646c" PRIMARY KEY ("adId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88c37707a52c0b2a820a8d4ebc" ON "ad_tags_tag" ("adId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd22b65edffb7dd9c8f1a79052" ON "ad_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "ad" ADD CONSTRAINT "FK_c418809c6e081f861cefe495668" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad" ADD CONSTRAINT "FK_ee93b44ac1911e95b7026881c28" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_ads_ad" ADD CONSTRAINT "FK_9af5c0789da7135949e01590d0e" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_ads_ad" ADD CONSTRAINT "FK_2e21c616c1e011ddc661cab145f" FOREIGN KEY ("adId") REFERENCES "ad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad_tags_tag" ADD CONSTRAINT "FK_88c37707a52c0b2a820a8d4ebc4" FOREIGN KEY ("adId") REFERENCES "ad"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad_tags_tag" ADD CONSTRAINT "FK_cd22b65edffb7dd9c8f1a790527" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ad_tags_tag" DROP CONSTRAINT "FK_cd22b65edffb7dd9c8f1a790527"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad_tags_tag" DROP CONSTRAINT "FK_88c37707a52c0b2a820a8d4ebc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_ads_ad" DROP CONSTRAINT "FK_2e21c616c1e011ddc661cab145f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_ads_ad" DROP CONSTRAINT "FK_9af5c0789da7135949e01590d0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad" DROP CONSTRAINT "FK_ee93b44ac1911e95b7026881c28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad" DROP CONSTRAINT "FK_c418809c6e081f861cefe495668"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cd22b65edffb7dd9c8f1a79052"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88c37707a52c0b2a820a8d4ebc"`,
    );
    await queryRunner.query(`DROP TABLE "ad_tags_tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2e21c616c1e011ddc661cab145"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9af5c0789da7135949e01590d0"`,
    );
    await queryRunner.query(`DROP TABLE "tag_ads_ad"`);
    await queryRunner.query(`DROP TABLE "ad"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "category"`);
  }
}
