import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMessageDto, UpdateMessageDto } from '../dtos/messsages.dtos';
import { MessagesService } from './../services/messages.service';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @ApiOperation({
    summary: 'Gets configuration messages',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async get() {
    try {
      return await this.messagesService.findAll();
    } catch (error) {
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: 'Creates configuration messages',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateMessageDto) {
    try {
      return await this.messagesService.create(payload);
    } catch (error) {
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: 'Updates configuration messages',
  })
  @Put(':id')
  async update(@Param('id') id: number, @Body() payload: UpdateMessageDto) {
    try {
      return await this.messagesService.update(id, payload);
    } catch (error) {
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: 'Deletes configuration messages',
  })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      return await this.messagesService.remove(id);
    } catch (error) {
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
