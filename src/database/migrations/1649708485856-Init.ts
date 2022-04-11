import {MigrationInterface, QueryRunner} from "typeorm";

export class Init1649708485856 implements MigrationInterface {
    name = 'Init1649708485856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "messages" ("id" SERIAL NOT NULL, "sms" character varying(255) NOT NULL, "mail" character varying(255) NOT NULL, "mail_title" character varying(255) NOT NULL, "call" character varying(255) NOT NULL, "no_data_sms" character varying(255) NOT NULL, "no_data_mail" character varying(255) NOT NULL, "no_data_call" character varying(255) NOT NULL, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "messages"`);
    }

}
