import { ConfigModule } from '@nestjs/config';
import config from './config';
import * as Joi from 'joi';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        SERVER_HOST: Joi.string().required(),
        SERVER_PORT: Joi.number().required(),
        REQUEST_TIMEOUT: Joi.number().required(),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
