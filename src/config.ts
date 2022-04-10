import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    server: {
      host: process.env.SERVER_HOST,
      port: process.env.SERVER_PORT,
      requestTimeout: process.env.REQUEST_TIMEOUT,
      useSms: process.env.USE_SMS,
      useEmail: process.env.USE_EMAIL,
      useCall: process.env.USE_CALL,
    },
    twilio: {
      accountId: process.env.TWILIO_ACCOUNT_ID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      messageServiceId: process.env.TWILIO_MESSAGE_SERVICE_ID,
      callSender: process.env.TWILIO_CALL_SENDER,
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  };
});
