import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: any;
  private accountSid = process.env.TWILIO_ACCOUNT_ID;
  private authToken = process.env.TWILIO_AUTH_TOKEN;
  private messageServiceId = process.env.TWILIO_MESSAGE_SERVICE_ID;

  constructor(private configService: ConfigService) {
    this.accountSid = configService.get<string>('TWILIO_ACCOUNT_ID');
    this.authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
    this.messageServiceId = configService.get<string>(
      'TWILIO_MESSAGE_SERVICE_ID',
    );
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
      }, parseInt(this.configService.get<string>('REQUEST_TIMEOUT')));
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
      }, parseInt(this.configService.get<string>('REQUEST_TIMEOUT')));
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
      }, parseInt(this.configService.get<string>('REQUEST_TIMEOUT')));
    });
  }
}
