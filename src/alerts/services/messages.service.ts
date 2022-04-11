import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto, UpdateMessageDto } from '../dtos/messsages.dtos';
import { Message } from './../entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {}

  async findAll() {
    return await this.messageRepo.find();
  }

  async create(data: CreateMessageDto) {
    const newProduct = this.messageRepo.create(data);
    return await this.messageRepo.save(newProduct);
  }

  async update(id: number, changes: UpdateMessageDto) {
    const message = await this.messageRepo.findOne(id);
    this.messageRepo.merge(message, changes);
    return await this.messageRepo.save(message);
  }

  async remove(id: number) {
    const index = await this.messageRepo.findOne(id);
    await this.messageRepo.delete(index);
    return true;
  }
}
