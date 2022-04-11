import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  sms: string;

  @Column({ type: 'varchar', length: 255 })
  mail: string;

  @Column({ name: 'mail_title', type: 'varchar', length: 255 })
  mailTitle: string;

  @Column({ type: 'varchar', length: 255 })
  call: string;

  @Column({ name: 'no_data_sms', type: 'varchar', length: 255 })
  noDataSms: string;

  @Column({ name: 'no_data_mail', type: 'varchar', length: 255 })
  noDataMail: string;

  @Column({ name: 'no_data_call', type: 'varchar', length: 255 })
  noDataCall: string;
}
