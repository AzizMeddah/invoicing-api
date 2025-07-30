import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { PAYMENT_MODE } from '../../enums/payment-mode.enum';
import { CreateSellingPaymentInvoiceEntryDto } from './selling-payment-invoice-entry.create.dto';
import { CreateSellingPaymentUploadDto } from './selling-payment-upload.create.dto';


export class CreateSellingPaymentDto {
  @ApiProperty({ example: 1, type: Number })
  id?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  amount?: number;

  @ApiProperty({
    example: '15.0',
    type: Number,
  })
  fee?: number;


  @ApiProperty({ example: faker.date.anytime(), type: Date })
  date?: Date;

  @ApiProperty({
    example: PAYMENT_MODE.Cash,
    enum: PAYMENT_MODE,
  })
  @IsEnum(PAYMENT_MODE)
  @IsOptional()
  mode?: PAYMENT_MODE;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  notes?: string;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  currencyId?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  @IsPositive()
  convertionRateToCabinet?: number;


  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateSellingPaymentUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoices?: CreateSellingPaymentInvoiceEntryDto[];
}
