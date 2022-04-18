import { Module } from '@nestjs/common';

import { AlertsController } from './controllers/alerts.controller';

import { GrafanaService } from './services/grafana.service';
import { TwilioService } from './services/twilio.service';
import { MailService } from './services/mail.service';

@Module({
  imports: [],
  controllers: [AlertsController],
  providers: [GrafanaService, TwilioService, MailService],
})
export class AlertsModule {}
