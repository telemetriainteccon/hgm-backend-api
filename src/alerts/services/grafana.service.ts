import { Inject, Injectable } from '@nestjs/common';

import config from '../../config';
import {
  Alert,
  GrafanaRequest,
  LoggerResult,
  MessageResult,
} from '../interfaces/grafana.interfaces';
import * as sensors from '../assets/sensors.json';
import * as sensorsNoData from '../assets/sensors-no-data.json';
import * as jsonMessages from '../assets/messages.json';
import { MailService } from './mail.service';
import { TwilioService } from './twilio.service';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class GrafanaService {
  constructor(
    private mailService: MailService,
    private twilioService: TwilioService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  async send(payload: GrafanaRequest) {
    try {
      console.log(' ');
      console.log('--- GRAFANA REQUEST');
      console.log(' ');
      console.log(JSON.stringify(payload));
      console.log(' ');

      this.format(payload).then(async (messagesResult: MessageResult[]) => {
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

            // SEND SMSs
            if (this.configService.server.useSms.toLowerCase() == 'true') {
              for (let index = 0; index < smss.length; index++) {
                const sms = smss[index];
                const smsId = await this.twilioService.sendSms(
                  message.sms_message,
                  sms,
                );

                loggerCollector.push({
                  location: message.location,
                  target: sms,
                  type: 'SMS',
                  logId: smsId,
                  date: Date(),
                });
              }
            }

            // SEND EMAILS
            if (this.configService.server.useEmail.toLowerCase() == 'true') {
              for (let index = 0; index < mails.length; index++) {
                const mail = mails[index];

                try {
                  await this.mailService.sendEmail(
                    this.configService.smtp.user,
                    mail,
                    jsonMessages.mail_title,
                    message.mail_message,
                    '',
                  );

                  loggerCollector.push({
                    location: message.location,
                    target: mail,
                    type: 'MAIL',
                    logId: '',
                    date: Date(),
                  });
                } catch (error) {
                  console.log(' ');
                  console.log(
                    `--- SE PRESENTO UN ERROR ENVIANDO: ${mail} ` + error,
                  );
                  console.log(' ');
                }
              }
            }

            // SEND CALLS
            if (this.configService.server.useCall.toLowerCase() == 'true') {
              for (let index = 0; index < calls.length; index++) {
                const call = calls[index];
                const callId = await this.twilioService.makeCall(
                  message.call_message,
                  this.configService.twilio.callSender,
                  call,
                );

                loggerCollector.push({
                  location: message.location,
                  target: call,
                  type: 'CALL',
                  logId: callId,
                  date: Date(),
                });
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
            console.table(loggerList, ['location', 'target', 'type', 'logId']);
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

  private format(message: GrafanaRequest): Promise<MessageResult[]> {
    return new Promise((resolve) => {
      const messagesResult = [];
      try {
        message.alerts.forEach((alert: Alert) => {
          try {
            const formattedObj: MessageResult = {
              call_message: '',
              mail_message: '',
              sms_message: '',
              location: '',
              isNoData: false,
            };

            let alertName = alert.labels.alertname;

            try {
              alertName = alert.labels.alertname.substr(
                alert.labels.Variable == 'T' ? 14 : 10,
                alert.labels.alertname.length,
              );
            } catch (error) {}

            const alertVariable =
              alert.labels.Variable == 'T' ? 'Temperatura' : 'Humedad';
            const alertMeassure = alert.labels.Variable == 'T' ? 'C' : 'HR';
            const alertLink = message.externalURL;

            // ALERT DATE
            const fullDate = new Date(alert.startsAt);
            const date = fullDate.toLocaleDateString('es-CO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });
            const time = fullDate.toLocaleTimeString();
            const alertDate = `${date} ${time}`;

            // ALERT DATE REPEATED
            const fullDateRepeated = new Date();
            const dateRepeated = fullDateRepeated.toLocaleDateString('es-CO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });
            const timeRepeated = fullDateRepeated.toLocaleTimeString();
            const alertDateRepeated = `${dateRepeated} ${timeRepeated}`;

            let alertValue = '';

            try {
              alertValue = alert.valueString.split('value')[1].replace(']', '');
            } catch (error) {}

            let result = JSON.stringify(jsonMessages);
            result = result.replaceAll('[AlertName]', alertName);
            result = result.replaceAll('[AlertLink]', alertLink);
            result = result.replaceAll('[AlertVariable]', alertVariable);
            result = result.replaceAll('[AlertMeassure]', alertMeassure);
            result = result.replaceAll('[AlertValue]', alertValue);
            result = result.replaceAll('[AlertDate]', alertDate);
            result = result.replaceAll(
              '[AlertDateRepeated]',
              alertDateRepeated,
            );
            const res_message = JSON.parse(result);

            console.log(
              'ValueString ---------------------------- ' + alert.valueString,
            );

            if (
              alert.valueString == '' ||
              alert.valueString.indexOf('NoData') != -1
            ) {
              formattedObj.isNoData = true;
              formattedObj.sms_message = res_message.sms_no_data;
              formattedObj.mail_message = res_message.mail_no_data;
              formattedObj.call_message = res_message.call_no_data;
            } else {
              formattedObj.sms_message = res_message.sms;
              formattedObj.mail_message = res_message.mail;
              formattedObj.call_message = res_message.call;
            }

            formattedObj.location = alert.labels.Ubicacion;
            messagesResult.push(formattedObj);
          } catch (error) {
            console.log(
              'SE PRESENTO UN ERROR FORMATIANDO ALERTA (1): ' + error,
            );
            console.log(' ');
          }
        });

        resolve(messagesResult);
      } catch (error) {
        console.log('SE PRESENTO UN ERROR FORMATIANDO ALERTA (2): ' + error);
        console.log(' ');
        resolve(messagesResult);
      }
    });
  }
}
