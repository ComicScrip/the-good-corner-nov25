import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771922982050 implements MigrationInterface {
    name = "Migration1771922982050";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "avatar" character varying NOT NULL DEFAULT 'https://media.istockphoto.com/id/1300845620/fr/vectoriel/appartement-dic%C3%B4ne-dutilisateur-isol%C3%A9-sur-le-fond-blanc-symbole-utilisateur.jpg?s=612x612&w=0&k=20&c=BVOfS7mmvy2lnfBPghkN__k8OMsg7Nlykpgjn0YOHj0='`,
        );
        await queryRunner.query(`
            UPDATE "user"
            SET avatar = 'https://c1.alamy.com/thumbs/tcxt95/admin-icon-vector-male-user-person-profile-avatar-with-gear-cogwheel-for-settings-and-configuration-in-flat-color-glyph-pictogram-illustration-tcxt95.jpg'
            WHERE role = 'admin'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
    }
}
