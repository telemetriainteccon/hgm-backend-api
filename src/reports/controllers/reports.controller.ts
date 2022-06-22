import {
  Controller,
  HttpStatus,
  Get,
  Query,
  Param,
  HttpException,
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
}
