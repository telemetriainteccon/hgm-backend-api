import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import config from './../../config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: any;
  private accountSid: string;
  private authToken: string;
  private messageServiceId: string;

  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {
    this.accountSid = configService.twilio.accountId;
    this.authToken = configService.twilio.authToken;
    this.messageServiceId = configService.twilio.messageServiceId;
    this.client = twilio(this.accountSid, this.authToken);
  }

  // Send Whatsapp message
  sendWhatsapp(message: string, from: string, to: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.client.messages
          .create({ body: message, from: from, to: to })
          .then((message: any) => resolve(message.sid))
          .catch((err: any) => console.error(err))
          .done();
      }, parseInt(this.configService.server.requestTimeout));
    });
  }

  // Send SMS message
  sendSms(location: string, message: string, to: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.client.messages
          .create({
            body: message,
            messagingServiceSid: this.messageServiceId,
            to: to,
          })
          .then((message) =>
            resolve({
              location: location,
              target: to,
              type: 'SMS',
              logId: message.sid,
              date: Date(),
            }),
          )
          .catch((err: any) => console.error(err))
          .done();
      }, parseInt(this.configService.server.requestTimeout));
    });
  }

  // Make Call message
  makeCall(location: string, message: string, from: string, to: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.client.calls
          .create({
            twiml: `<Response><Say language="es-MX" voice="Polly.Miguel">${message}</Say></Response>`,
            to: to,
            from: from,
          })
          .then((call) =>
            resolve({
              location: location,
              target: to,
              type: 'CALL',
              logId: call.sid,
              date: Date(),
            }),
          )
          .catch((err: any) => console.error(err));
      }, parseInt(this.configService.server.requestTimeout));
    });
  }
}
