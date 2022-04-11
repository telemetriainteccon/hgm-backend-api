import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    server: {
      host: process.env.SERVER_HOST,
      port: process.env.SERVER_PORT,
      requestTimeout: process.env.SERVER_REQUEST_TIMEOUT,
      useSms: process.env.USE_SMS,
      useEmail: process.env.USE_EMAIL,
      useCall: process.env.USE_CALL,
    },
    database: {
      name: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
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
