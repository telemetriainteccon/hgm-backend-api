import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';
import * as nodeMailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: any;
  private smtpHost: string;
  private smptPort: string;
  private smtpUser: string;
  private smtpPwd: string;
  constructor(private configService: ConfigService) {
    this.smtpHost = configService.get<string>('SMTP_HOST');
    this.smptPort = configService.get<string>('SMTP_PORT');
    this.smtpUser = configService.get<string>('SMTP_USER');
    this.smtpPwd = configService.get<string>('SMTP_PASSWORD');

    this.transporter = nodeMailer.createTransport({
      host: this.smtpHost,
      port: parseInt(this.smptPort),
      auth: { user: this.smtpUser, pass: this.smtpPwd },
    });
  }

  sendEmail(
    location: string,
    from: string,
    to: string,
    subject: string,
    text: string,
    html: string,
  ) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.transporter.verify().then().catch(console.error);
        this.transporter
          .sendMail({
            from: from,
            to: to,
            subject: subject,
            text: text,
            html: html,
          })
          .then(() =>
            resolve({
              location: location,
              target: to,
              type: 'MAIL',
              logId: '',
              date: Date(),
            }),
          )
          .catch((err: any) => console.error(err));
      }, parseInt(this.configService.get<string>('REQUEST_TIMEOUT')));
    });
  }
}
