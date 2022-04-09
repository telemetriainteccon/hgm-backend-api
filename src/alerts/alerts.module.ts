import { Module } from '@nestjs/common';
import { AlertsController } from './controllers/alerts.controller';
import { AlertsService } from './services/alerts.service';
import { TwilioService } from './services/twilio.service';
import { MailService } from './services/mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AlertsController],
  providers: [AlertsService, TwilioService, MailService],
})
export class AlertsModule {}
