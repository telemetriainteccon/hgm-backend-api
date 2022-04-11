import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlertsController } from './controllers/alerts.controller';
import { MessagesController } from './controllers/messages.controller';

import { Message } from './entities/message.entity';
import { GrafanaService } from './services/grafana.service';
import { TwilioService } from './services/twilio.service';
import { MailService } from './services/mail.service';
import { MessagesService } from './services/messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [AlertsController, MessagesController],
  providers: [GrafanaService, TwilioService, MailService, MessagesService],
})
export class AlertsModule {}
