import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import config from '../../config';
import * as nodeMailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: any;
  private smtpHost: string;
  private smptPort: string;
  private smtpUser: string;
  private smtpPwd: string;
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {
    this.smtpHost = configService.smtp.host;
    this.smptPort = configService.smtp.port;
    this.smtpUser = configService.smtp.user;
    this.smtpPwd = configService.smtp.password;

    this.transporter = nodeMailer.createTransport({
      host: this.smtpHost,
      port: parseInt(this.smptPort),
      auth: { user: this.smtpUser, pass: this.smtpPwd },
    });
  }

  sendEmail(
    from: string,
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.transporter.verify().then().catch(console.error);

        console.log('--------------------------');
        console.log('From: ' + from);
        console.log('To: ' + to);
        console.log('Subject: ' + subject);
        console.log('Text: ' + text);
        console.log(' ');

        this.transporter
          .sendMail({
            from: from,
            to: to,
            subject: subject,
            text: text,
            html: html,
          })
          .then(() => resolve(true))
          .catch((err: any) => console.error(err));
      }, parseInt(this.configService.server.requestTimeout));
    });
  }
}
