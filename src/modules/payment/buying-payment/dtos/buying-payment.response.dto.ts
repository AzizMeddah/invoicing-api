import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_MODE } from '../../enums/payment-mode.enum';
import { ResponseBuyingPaymentInvoiceEntryDto } from './buying-payment-invoice-entry.response.dto';
import { ResponseBuyingPaymentUploadDto } from './buying-payment-upload.response.dto';



export class ResponseBuyingPaymentDto {
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


  @ApiProperty({
    example: '1',
    type: Number,
  })
  firmId?: number;


  @ApiProperty({ example: faker.date.anytime(), type: Date })
  date?: Date;

  @ApiProperty({
    example: PAYMENT_MODE.Cash,
    enum: PAYMENT_MODE,
  })
  mode?: PAYMENT_MODE;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  notes?: string;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  currencyId?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  convertionRateToCabinet?: number;


  @ApiProperty({ required: false })
  uploads?: ResponseBuyingPaymentUploadDto[];

  @ApiProperty({ required: false })
  invoices?: ResponseBuyingPaymentInvoiceEntryDto[];
}
