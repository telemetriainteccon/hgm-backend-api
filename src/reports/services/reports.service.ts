import { Inject, Injectable } from '@nestjs/common';
import { InfluxDB, QueryApi, Point } from '@influxdata/influxdb-client';
import { ConfigType } from '@nestjs/config';
import config from './../../config';
import { reportMmaDto } from '../dtos/reportMma.dto';
import { Double } from 'typeorm';

type infoType =
  | 'fullMin'
  | 'fullMax'
  | 'fullMean'
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
  /// Get Active servers by SensorId
  ///
  async GetActiveServersBySensorId(sensorId: number) {
    const queryString = `from(bucket: "Hospital")
                          |> range(start: 2020-01-01T05:00:00.000Z, stop: 2023-01-01T05:00:00.000Z)
                          |> filter(fn: (r) => r["_measurement"] == "sensors")
                          |> filter(fn: (r) => r["I"] == "${sensorId}")
                          |> aggregateWindow(every: 5m, fn: last, createEmpty: false)
                          |> count()`;

    const result: any = await this.execInfluxRawQuery(queryString);

    const activeDroplets = result.reduce(
      (activeServers: any, data: any, index: number) => {
        if (data.length > 0) activeServers.push(index + 1);
        return activeServers;
      },
      [],
    );

    return activeDroplets;
  }

  ///
  /// Insert data into Influx
  ///
  async loadData(
    sensorId: number,
    dropletId: number,
    minDateISO: Date,
    data: any,
  ) {
    for (const item of data) {
      const time = item[0];
      const valueT = item[1];
      const valueH = item[2];

      await this.insertPoint(
        sensorId,
        dropletId,
        minDateISO,
        'T',
        valueT,
        time,
      );
      await this.insertPoint(
        sensorId,
        dropletId,
        minDateISO,
        'H',
        valueH,
        time,
      );
    }

    return 'OK';
  }

  ///
  /// Insert point
  ///
  async insertPoint(
    sensorId: number,
    dropletId: number,
    minDateISO: Date,
    field: string,
    value: Double,
    time: string,
  ) {
    let credentials = {
      url: this.configService.influx.InfluxHost1,
      token: this.configService.influx.InfluxToken1,
    };

    switch (dropletId) {
      case 2: {
        credentials = {
          url: this.configService.influx.InfluxHost2,
          token: this.configService.influx.InfluxToken2,
        };
        break;
      }
      case 3: {
        credentials = {
          url: this.configService.influx.InfluxHost3,
          token: this.configService.influx.InfluxToken3,
        };
        break;
      }
      case 4: {
        credentials = {
          url: this.configService.influx.InfluxHost4,
          token: this.configService.influx.InfluxToken4,
        };
        break;
      }
      default:
        break;
    }

    const writeApi = new InfluxDB(credentials).getWriteApi(
      this.configService.influx.InfluxOrg,
      this.configService.influx.InfluxBucket,
      'ms',
    );

    writeApi.useDefaultTags({ host: `droplet${dropletId}`, I: `${sensorId}` });

    const date = new Date(minDateISO);
    const timeStamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      parseInt(time.split(':')[0]),
      parseInt(time.split(':')[1]),
      parseInt(time.split(':')[2]),
    );

    const newPointT = new Point('sensors')
      .floatField(field, value)
      .timestamp(timeStamp);

    writeApi.writePoint(newPointT);

    try {
      await writeApi.close();
      return 'OK';
    } catch (e) {
      return 'error - ' + e;
    }
  }

  ///
  /// Gets Influx Values and return the Json result
  ///
  async getReportMma(
    sensorId: number,
    minDateISO: Date,
    maxDateISO: Date,
    type: string,
  ) {
    const dates = this.getDatesbyRange(
      [],
      new Date(new Date(new Date(minDateISO).setHours(-24)).toISOString()),
      new Date(maxDateISO),
    );

    dates.pop();

    const queryString = this.getDynamicQueries(sensorId, dates, type);
    const objResult: any = await this.execInfluxQuery(queryString);

    const reportMmaResult: reportMmaDto[] = [];
    for (let index = 0; index < dates.length; index++) {
      const date = dates[index];

      const objFmin = this.filterListByDate(objResult.fullMinRes, date);
      const objFmax = this.filterListByDate(objResult.fullMaxRes, date);
      const objFmean = this.filterListByDate(objResult.fullMeanRes, date);
      const objMmin = this.filterListByDate(objResult.morningMinRes, date);
      const objMmax = this.filterListByDate(objResult.morningMaxRes, date);
      const objMmean = this.filterListByDate(objResult.morningMeanRes, date);
      const objAmin = this.filterListByDate(objResult.afternMinRes, date);
      const objAmax = this.filterListByDate(objResult.afternMaxRes, date);
      const objAmean = this.filterListByDate(objResult.afternMeanRes, date);

      const _date = new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      const newReportMmaResult: reportMmaDto = {
        date: _date,
        f: {
          timeMin: _date + ' ' + objFmin.time,
          min: objFmin.value,
          timeMax: _date + ' ' + objFmax.time,
          max: objFmax.value,
          timeMean: _date + ' ' + objFmean.time,
          mean: objFmean.value,
        },
        m: {
          timeMin: _date + ' ' + objMmin.time,
          min: objMmin.value,
          timeMax: _date + ' ' + objMmax.time,
          max: objMmax.value,
          timeMean: _date + ' ' + objMmean.time,
          mean: objMmean.value,
        },
        t: {
          timeMin: _date + ' ' + objAmin.time,
          min: objAmin.value,
          timeMax: _date + ' ' + objAmax.time,
          max: objAmax.value,
          timeMean: _date + ' ' + objAmean.time,
          mean: objAmean.value,
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

    return {
      value: result
        ? Number(parseFloat(parseFloat(result._value).toFixed(2)).toFixed(1))
        : '-',
      time: result?._time
        ? new Date(result._time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
        : '-',
    };
  }

  ///
  /// Gets Influx Query Template for MAX
  ///
  private getDynamicQueries(sensorId: number, dates: Date[], type: string) {
    let queryString = '';

    const influxTables = [];
    for (let index = 0; index < dates.length; index++) {
      const date = dates[index];
      const morningMinDate = new Date(new Date(date).setHours(0, 0, 0));
      const morningMaxDate = new Date(new Date(date).setHours(11, 59, 59));
      const afternMinDate = new Date(new Date(date).setHours(12, 0, 0));
      const afternMaxDate = new Date(new Date(date).setHours(23, 59, 59));

      queryString +=
        `tfmin${index} =` +
        this.getQueryTemplate(
          'fullMin',
          'min',
          sensorId,
          morningMinDate,
          afternMaxDate,
          type,
        );

      queryString +=
        `tfmax${index} =` +
        this.getQueryTemplate(
          'fullMax',
          'max',
          sensorId,
          morningMinDate,
          afternMaxDate,
          type,
        );

      queryString +=
        `tfmean${index} =` +
        this.getQueryTemplate(
          'fullMean',
          'mean',
          sensorId,
          morningMinDate,
          afternMaxDate,
          type,
        );

      queryString +=
        `tmmin${index} =` +
        this.getQueryTemplate(
          'morningMin',
          'min',
          sensorId,
          morningMinDate,
          morningMaxDate,
          type,
        );

      queryString +=
        `tmmax${index} =` +
        this.getQueryTemplate(
          'morningMax',
          'max',
          sensorId,
          morningMinDate,
          morningMaxDate,
          type,
        );

      queryString +=
        `tmmean${index} =` +
        this.getQueryTemplate(
          'morningMean',
          'mean',
          sensorId,
          morningMinDate,
          morningMaxDate,
          type,
        );

      queryString +=
        `tamin${index} =` +
        this.getQueryTemplate(
          'afternMin',
          'min',
          sensorId,
          afternMinDate,
          afternMaxDate,
          type,
        );

      queryString +=
        `tamax${index} =` +
        this.getQueryTemplate(
          'afternMax',
          'max',
          sensorId,
          afternMinDate,
          afternMaxDate,
          type,
        );

      queryString +=
        `tamean${index} =` +
        this.getQueryTemplate(
          'afternMean',
          'mean',
          sensorId,
          afternMinDate,
          afternMaxDate,
          type,
        );

      influxTables.push(`tfmin${index}`);
      influxTables.push(`tfmax${index}`);
      influxTables.push(`tfmean${index}`);
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
          fullMinRes: res.filter((x: any) => x.type == 'fullMin'),
          fullMaxRes: res.filter((x: any) => x.type == 'fullMax'),
          fullMeanRes: res.filter((x: any) => x.type == 'fullMean'),
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
  /// Execute the dynamic raw query on each INFLUX SERVER (1,2,3,4)
  ///
  private async execInfluxRawQuery(queryString: string) {
    return new Promise((resolve) => {
      Promise.all([
        this.executeQuery(queryString, this.influxHost1),
        this.executeQuery(queryString, this.influxHost2),
        this.executeQuery(queryString, this.influxHost3),
        this.executeQuery(queryString, this.influxHost4),
      ]).then((result) => {
        resolve(result);
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
    sensorType: string,
  ) {
    return `from(bucket: "${this.configService.influx.InfluxBucket}")
      |> range(start: ${minDateISO.toISOString()}, stop: ${maxDateISO.toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "sensors")
      |> filter(fn: (r) => r["I"] == "${sensorId}")
      |> filter(fn: (r) => r["_field"] == "${sensorType}")
      |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
      |> ${functionName}()
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
