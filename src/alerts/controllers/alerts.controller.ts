import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GrafanaRequest } from '../interfaces/grafana.interfaces';
import { GrafanaService } from '../services/grafana.service';

@ApiTags('Grafana WebHook')
@Controller('alerts')
export class AlertsController {
  constructor(private grafanaService: GrafanaService) {}

  @ApiOperation({
    summary: 'Receive Grafana alerts to send using Emails/SMS/Calls',
  })
  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  async send(@Body() payload: GrafanaRequest) {
    try {
      return await this.grafanaService.send(payload);
    } catch (error) {}
  }
}
