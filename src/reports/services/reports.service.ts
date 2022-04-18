import { Inject, Injectable } from '@nestjs/common';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import { ConfigType } from '@nestjs/config';
import config from './../../config';
import { reportMmaDto } from '../dtos/reportMma.dto';

type infoType =
  | 'morningMin'
  | 'morningMax'
  | 'morningMean'
  | 'afternMin'
  | 'afternMax'
  | 'afternMean';

@Injectable()
export class ReportsService {
  timeout = 10000;
  influxHost1: QueryApi;
  influxHost2: QueryApi;
  influxHost3: QueryApi;
  influxHost4: QueryApi;

  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {
    this.influxHost1 = new InfluxDB({
      url: this.configService.influx.InfluxHost1,
      token: this.configService.influx.InfluxToken1,
      timeout: this.timeout,
    }).getQueryApi(this.configService.influx.InfluxOrg);

    this.influxHost2 = new InfluxDB({
      url: this.configService.influx.InfluxHost2,
      token: this.configService.influx.InfluxToken2,
      timeout: this.timeout,
    }).getQueryApi(this.configService.influx.InfluxOrg);

    this.influxHost3 = new InfluxDB({
      url: this.configService.influx.InfluxHost3,
      token: this.configService.influx.InfluxToken3,
      timeout: this.timeout,
    }).getQueryApi(this.configService.influx.InfluxOrg);

    this.influxHost4 = new InfluxDB({
      url: this.configService.influx.InfluxHost4,
      token: this.configService.influx.InfluxToken4,
      timeout: this.timeout,
    }).getQueryApi(this.configService.influx.InfluxOrg);
  }

  ///
  /// Gets Influx Values and return the Json result
  ///
  async getReportMma(sensorId: number, minDateISO: Date, maxDateISO: Date) {
    const dates = this.getDatesbyRange(
      [],
      new Date(new Date(new Date(minDateISO).setHours(-24)).toISOString()),
      new Date(maxDateISO),
    );

    dates.pop();

    const queryString = this.getDynamicQueries(sensorId, dates);
    const objResult: any = await this.execInfluxQuery(queryString);

    const reportMmaResult: reportMmaDto[] = [];
    for (let index = 0; index < dates.length; index++) {
      const date = dates[index];

      const newReportMmaResult: reportMmaDto = {
        date: new Date(date).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        m: {
          min: this.filterListByDate(objResult.morningMinRes, date),
          max: this.filterListByDate(objResult.morningMaxRes, date),
          mean: this.filterListByDate(objResult.morningMeanRes, date),
        },
        t: {
          min: this.filterListByDate(objResult.afternMinRes, date),
          max: this.filterListByDate(objResult.afternMaxRes, date),
          mean: this.filterListByDate(objResult.afternMeanRes, date),
        },
      };

      reportMmaResult.push(newReportMmaResult);
    }

    return reportMmaResult;
  }

  ///
  /// Filter list by Date
  ///
  private filterListByDate(list: any, date: any) {
    const result = list.find(
      (x: any) => x._start.substr(0, 10) == date.toISOString().substr(0, 10),
    );

    return result ? result._value.toFixed(1) : -1;
  }

  ///
  /// Gets Influx Query Template for MAX
  ///
  private getDynamicQueries(sensorId: number, dates: Date[]) {
    let queryString = '';

    const influxTables = [];
    for (let index = 0; index < dates.length; index++) {
      const date = dates[index];
      const morningMinDate = new Date(new Date(date).setHours(0, 0, 0));
      const morningMaxDate = new Date(new Date(date).setHours(11, 59, 59));
      const afternMinDate = new Date(new Date(date).setHours(12, 0, 0));
      const afternMaxDate = new Date(new Date(date).setHours(23, 59, 59));

      queryString +=
        `tmmin${index} =` +
        this.getQueryTemplate(
          'morningMin',
          'min',
          sensorId,
          morningMinDate,
          morningMaxDate,
        );

      queryString +=
        `tmmax${index} =` +
        this.getQueryTemplate(
          'morningMax',
          'max',
          sensorId,
          morningMinDate,
          morningMaxDate,
        );

      queryString +=
        `tmmean${index} =` +
        this.getQueryTemplate(
          'morningMean',
          'mean',
          sensorId,
          morningMinDate,
          morningMaxDate,
        );

      queryString +=
        `tamin${index} =` +
        this.getQueryTemplate(
          'afternMin',
          'min',
          sensorId,
          afternMinDate,
          afternMaxDate,
        );

      queryString +=
        `tamax${index} =` +
        this.getQueryTemplate(
          'afternMax',
          'max',
          sensorId,
          afternMinDate,
          afternMaxDate,
        );

      queryString +=
        `tamean${index} =` +
        this.getQueryTemplate(
          'afternMean',
          'mean',
          sensorId,
          afternMinDate,
          afternMaxDate,
        );

      influxTables.push(`tmmin${index}`);
      influxTables.push(`tmmax${index}`);
      influxTables.push(`tmmean${index}`);
      influxTables.push(`tamin${index}`);
      influxTables.push(`tamax${index}`);
      influxTables.push(`tamean${index}`);
    }

    queryString +=
      influxTables.length > 1
        ? `union(tables: [${influxTables.join(',')}])`
        : influxTables.flat();

    return queryString;
  }

  ///
  /// Execute the dynamic query on each INFLUX SERVER (1,2,3,4)
  ///
  private async execInfluxQuery(queryString: string) {
    return new Promise((resolve) => {
      Promise.all([
        this.executeQuery(queryString, this.influxHost1),
        this.executeQuery(queryString, this.influxHost2),
        this.executeQuery(queryString, this.influxHost3),
        this.executeQuery(queryString, this.influxHost4),
      ]).then((result) => {
        const val = result.filter((item) => item.length != 0);
        const res = val && val.length > 0 ? val[0] : [];

        resolve({
          morningMinRes: res.filter((x: any) => x.type == 'morningMin'),
          morningMaxRes: res.filter((x: any) => x.type == 'morningMax'),
          morningMeanRes: res.filter((x: any) => x.type == 'morningMean'),
          afternMinRes: res.filter((x: any) => x.type == 'afternMin'),
          afternMaxRes: res.filter((x: any) => x.type == 'afternMax'),
          afternMeanRes: res.filter((x: any) => x.type == 'afternMean'),
        });
      });
    });
  }

  ///
  /// Gets Influx Query Template
  ///
  private getQueryTemplate(
    type: infoType,
    functionName: string,
    sensorId: number,
    minDateISO: Date,
    maxDateISO: Date,
  ) {
    return `from(bucket: "${this.configService.influx.InfluxBucket}")
      |> range(start: ${minDateISO.toISOString()}, stop: ${maxDateISO.toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "sensors")
      |> filter(fn: (r) => r["I"] == "${sensorId}")
      |> filter(fn: (r) => r["_field"] == "T")
      |> ${functionName}()
      ${
        functionName !== 'mean'
          ? `|> aggregateWindow(every: 1m, fn: ${functionName}, createEmpty: false)`
          : ``
      }
      |> set(key: "type",value: "${type}")
    `;
  }

  ///
  /// Executes a query on Influx Server
  ///
  private executeQuery(query: string, queryApi: QueryApi): Promise<any> {
    return new Promise((resolve) => {
      const results = [];
      const fluxObserver = {
        next(row: any, tableMeta: any) {
          results.push(tableMeta.toObject(row));
        },
        error(error: any) {
          console.error(error);
          resolve([]);
        },
        complete() {
          resolve(results);
        },
      };

      queryApi.queryRows(query, fluxObserver);
    });
  }

  ///
  /// Recursive function to get dates by Range
  /// Returns Array with date list
  ///
  private getDatesbyRange(dates: Date[], minDate: Date, maxDate: Date) {
    if (minDate <= maxDate) {
      dates.push(minDate);
      this.getDatesbyRange(
        dates,
        new Date(minDate.setDate(minDate.getDate() + 1)),
        maxDate,
      );
    }

    return dates;
  }
}
