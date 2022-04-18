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
    influx: {
      InfluxOrg: process.env.INFLUX_ORG,
      InfluxBucket: process.env.INFLUX_BUCKET,
      InfluxHost1: process.env.INFLUX_HOST1,
      InfluxHost2: process.env.INFLUX_HOST2,
      InfluxHost3: process.env.INFLUX_HOST3,
      InfluxHost4: process.env.INFLUX_HOST4,
      InfluxToken1: process.env.INFLUX_TOKEN1,
      InfluxToken2: process.env.INFLUX_TOKEN2,
      InfluxToken3: process.env.INFLUX_TOKEN3,
      InfluxToken4: process.env.INFLUX_TOKEN4,
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
