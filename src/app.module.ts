import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import * as Joi from 'joi';

import { AlertsModule } from './alerts/alerts.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';

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

        DATABASE_NAME: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),

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
    UsersModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
