import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import * as Joi from 'joi';

import { AlertsModule } from './alerts/alerts.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        SERVER_HOST: Joi.string().required(),
        SERVER_PORT: Joi.number().required(),
        SERVER_REQUEST_TIMEOUT: Joi.number().required(),

        INFLUX_ORG: Joi.string().required(),
        INFLUX_BUCKET: Joi.string().required(),
        INFLUX_HOST1: Joi.string().required(),
        INFLUX_HOST2: Joi.string().required(),
        INFLUX_HOST3: Joi.string().required(),
        INFLUX_HOST4: Joi.string().required(),
        INFLUX_TOKEN1: Joi.string().required(),
        INFLUX_TOKEN2: Joi.string().required(),
        INFLUX_TOKEN3: Joi.string().required(),
        INFLUX_TOKEN4: Joi.string().required(),

        TWILIO_ACCOUNT_ID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        TWILIO_MESSAGE_SERVICE_ID: Joi.string().required(),
        TWILIO_CALL_SENDER: Joi.string().required(),

        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().required(),
        SMTP_USER: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),

        USE_SMS: Joi.boolean().required(),
        USE_EMAIL: Joi.boolean().required(),
        USE_CALL: Joi.boolean().required(),
      }),
    }),
    AlertsModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
