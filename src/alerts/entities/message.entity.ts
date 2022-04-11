import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  sms: string;

  @Column({ type: 'varchar', length: 255 })
  mail: string;

  @Column({ type: 'varchar', length: 255 })
  mail_title: string;

  @Column({ type: 'varchar', length: 255 })
  call: string;

  @Column({ type: 'varchar', length: 255 })
  no_data_sms: string;

  @Column({ type: 'varchar', length: 255 })
  no_data_mail: string;

  @Column({ type: 'varchar', length: 255 })
  no_data_call: string;
}
