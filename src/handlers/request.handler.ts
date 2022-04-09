import {
  Alert,
  GrafanaRequest,
  MessageResult,
} from 'src/interfaces/grafana.interfaces';
import * as jsonMessages from './../messages.json';

export class MessageHandler {
  format(message: GrafanaRequest): Promise<MessageResult[]> {
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

            const fullDate = new Date(alert.startsAt);
            const date = fullDate.toLocaleDateString('es-CO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });
            const time = fullDate.toLocaleTimeString();
            const alertDate = `${date} ${time}`;

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
            const res_message = JSON.parse(result);

            if (alert.valueString == '') {
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
