import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1782792075199 implements MigrationInterface {
    name = ' $npmConfigName1782792075199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "telefono" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "telefono"`);
    }

}
