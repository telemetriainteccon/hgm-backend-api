import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AlertsController } from './controllers/alerts.controller';
import { ReportsController } from './controllers/reports.controller';
import { AlertsService } from './services/alerts.service';
import { TwilioService } from './services/twilio.service';
import { MailService } from './services/mail.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, AlertsController, ReportsController],
  providers: [AppService, AlertsService, TwilioService, MailService],
})
export class AppModule {}
