import {MigrationInterface, QueryRunner} from "typeorm";

export class Init1649627489641 implements MigrationInterface {
    name = 'Init1649627489641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "sms" character varying(255) NOT NULL, "mail" character varying(255) NOT NULL, "mail_title" character varying(255) NOT NULL, "call" character varying(255) NOT NULL, "no_data_sms" character varying(255) NOT NULL, "no_data_mail" character varying(255) NOT NULL, "no_data_call" character varying(255) NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
