import { IsString, IsNotEmpty } from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: `Message to send by SMS` })
  readonly sms: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: `Message to send by Call` })
  readonly call: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: `Message to send by Email` })
  readonly mail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: `Email Title` })
  readonly mail_title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: `Message to send by SMS when no data`,
  })
  readonly no_data_sms: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: `Message to send by Call when no data`,
  })
  readonly no_data_call: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: `Message to send by Email when no data`,
  })
  readonly no_data_mail: string;
}

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}
