import {
  Controller,
  HttpStatus,
  Get,
  Post,
  Query,
  Param,
  HttpException,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @ApiOperation({
    summary:
      'Returns sensor data by date range grouping Min, Max and Current values by day',
  })
  @Get('report-mma/:id')
  //@HttpCode(HttpStatus.ACCEPTED)
  async reportMma(
    @Param('id') sensorId: number,
    @Query('minDate') minDateISO: Date,
    @Query('maxDate') maxDateISO: Date,
    @Query('type') type: string,
  ) {
    try {
      return this.reportsService.getReportMma(
        sensorId,
        minDateISO,
        maxDateISO,
        type,
      );
    } catch (error) {
      console.log(error);
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  @ApiOperation({
    summary: 'Returns active servers by sensor Id',
  })
  @Get('servers/:id')
  //@HttpCode(HttpStatus.ACCEPTED)
  async GetActiveServersBySensorId(@Param('id') sensorId: number) {
    try {
      return this.reportsService.GetActiveServersBySensorId(sensorId);
    } catch (error) {
      console.log(error);
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  @ApiOperation({
    summary: 'Load Data into influx',
  })
  @Post('loadData')
  async loadData(@Body() body: any) {
    try {
      const { sensorId, dropletId, minDateISO, data } = body;
      return this.reportsService.loadData(
        sensorId,
        dropletId,
        minDateISO,
        data,
      );
    } catch (error) {
      console.log(error);
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
