import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1783385555988 implements MigrationInterface {
    name = ' $npmConfigName1783385555988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "proveedores" ("id" SERIAL NOT NULL, "razon_social" character varying(150) NOT NULL, "ruc_o_dni" character varying(20) NOT NULL, "telefono" character varying(20), "direccion" character varying(255), "contacto_nombre" character varying(100), CONSTRAINT "UQ_276398da7893fbbfad4c5ead005" UNIQUE ("ruc_o_dni"), CONSTRAINT "PK_1dcf121f19f362fb1b4c0a493a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "kardex_movimientos" ("id" SERIAL NOT NULL, "tipo_movimiento" character varying(20) NOT NULL, "motivo" character varying(255) NOT NULL, "cantidad" integer NOT NULL, "fecha" TIMESTAMP NOT NULL DEFAULT now(), "productId" integer, "usuarioId" integer, CONSTRAINT "PK_e385b94c12df0dce150dcf83510" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD "proveedorId" integer`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_6dab3277ceb5b22b1e633deca8a" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kardex_movimientos" ADD CONSTRAINT "FK_539aa0be14ba48d4273ef67aa62" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kardex_movimientos" ADD CONSTRAINT "FK_7cbe87467a65fea28e75a3b3d9c" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kardex_movimientos" DROP CONSTRAINT "FK_7cbe87467a65fea28e75a3b3d9c"`);
        await queryRunner.query(`ALTER TABLE "kardex_movimientos" DROP CONSTRAINT "FK_539aa0be14ba48d4273ef67aa62"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_6dab3277ceb5b22b1e633deca8a"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "proveedorId"`);
        await queryRunner.query(`DROP TABLE "kardex_movimientos"`);
        await queryRunner.query(`DROP TABLE "proveedores"`);
    }

}
