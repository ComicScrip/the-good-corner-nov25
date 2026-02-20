import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771577611840 implements MigrationInterface {
    name = "Migration1771577611840";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "avatar" character varying NOT NULL DEFAULT 'https://media.istockphoto.com/id/1300845620/fr/vectoriel/appartement-dic%C3%B4ne-dutilisateur-isol%C3%A9-sur-le-fond-blanc-symbole-utilisateur.jpg?s=612x612&w=0&k=20&c=BVOfS7mmvy2lnfBPghkN__k8OMsg7Nlykpgjn0YOHj0='`,
        );
        // different default avatar for admins
        await queryRunner.query(`
            UPDATE "user" 
            SET avatar = 'https://media.istockphoto.com/id/954805524/vector/gear-icon-vector-male-user-person-profile-avatar-symbol-on-cog-wheel-for-settings-and.jpg?s=612x612&w=0&k=20&c=-3RDhk49KIK3XUwbjB9P6UkQ0NLWRgBdnB7hrieR-pA=' 
            WHERE role='admin' 
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
    }
}
