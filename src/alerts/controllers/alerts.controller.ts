import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import config from './../../config';

import { MessageHandler } from '../handlers/request.handler';
import {
  GrafanaRequest,
  MessageResult,
  LoggerResult,
} from '../interfaces/grafana.interfaces';
import { MailService } from '../services/mail.service';
import { TwilioService } from '../services/twilio.service';

import * as sensors from '../assets/sensors.json';
import * as sensorsNoData from '../assets/sensors-no-data.json';
import * as jsonMessages from '../assets/messages.json';

@ApiTags('Grafana WebHook')
@Controller('alerts')
export class AlertsController {
  private messageHandler: MessageHandler;
  constructor(
    private mailService: MailService,
    private twilioService: TwilioService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {
    this.messageHandler = new MessageHandler();
  }

  @ApiOperation({
    summary: 'Receive Grafana alerts to send Emails/SMS/Calls',
  })
  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  async send(@Body() payload: GrafanaRequest) {
    try {
      console.log(' ');
      console.log('--- GRAFANA REQUEST');
      console.log(' ');
      console.log(JSON.stringify(payload));
      console.log(' ');

      this.messageHandler
        .format(payload)
        .then(async (messagesResult: MessageResult[]) => {
          console.log(' ');
          console.log('--- NUMERO DE ALERTAS: ' + messagesResult.length);
          console.log(' ');
          console.log(JSON.stringify(messagesResult));
          console.log(' ');

          for (let index = 0; index < messagesResult.length; index++) {
            const message = messagesResult[index];

            try {
              const mails = !message.isNoData
                ? sensors[message.location].mails
                : sensorsNoData[message.location].mails;
              const calls = !message.isNoData
                ? sensors[message.location].calls
                : sensorsNoData[message.location].calls;
              const smss = !message.isNoData
                ? sensors[message.location].sms
                : sensorsNoData[message.location].sms;

              const loggerCollector = [];
              if (this.configService.server.useSms.toLowerCase() == 'true') {
                for (let index = 0; index < smss.length; index++) {
                  const sms = smss[index];
                  const target = await this.twilioService.sendSms(
                    message.location,
                    message.sms_message,
                    sms,
                  );

                  loggerCollector.push(target);
                }
              }

              if (this.configService.server.useEmail.toLowerCase() == 'true') {
                for (let index = 0; index < mails.length; index++) {
                  const mail = mails[index];

                  try {
                    const target = await this.mailService.sendEmail(
                      message.location,
                      this.configService.smtp.user,
                      mail,
                      jsonMessages.mail_title,
                      message.mail_message,
                      '',
                    );

                    loggerCollector.push(target);
                  } catch (error) {
                    console.log(' ');
                    console.log(
                      `--- SE PRESENTO UN ERROR ENVIANDO: ${mail} ` + error,
                    );
                    console.log(' ');
                  }
                }
              }

              if (this.configService.server.useCall.toLowerCase() == 'true') {
                for (let index = 0; index < calls.length; index++) {
                  const call = calls[index];
                  const target = await this.twilioService.makeCall(
                    message.location,
                    message.call_message,
                    this.configService.twilio.callSender,
                    call,
                  );

                  loggerCollector.push(target);
                }
              }

              const loggerList = loggerCollector.map((target) => {
                const item: LoggerResult = {
                  location: target.location,
                  target: target.target,
                  type: target.type,
                  logId: target.logId,
                  date: target.date,
                };

                return item;
              });

              console.log('');
              console.log('--- DETALLE DE ALERTA');
              console.log(Date());
              console.log(' ');
              console.table(loggerList, [
                'location',
                'target',
                'type',
                'logId',
              ]);
              console.log(' ');
              console.log(' ');
              console.log('--- ESPERANDO MAS ALERTAS...');
              console.log(' ');
            } catch (error) {
              console.log(' ');
              console.log('--- SE PRESENTO UN ERROR (3): ' + error);
              console.log(' ');
            }
          }
        });
    } catch (error) {
      console.log(' ');
      console.log('--- SE PRESENTO UN ERROR (4): ' + error);
      console.log(' ');
    }

    return 'OK';
  }
}
