import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_MODE } from '../../enums/payment-mode.enum';
import { ResponseSellingPaymentInvoiceEntryDto } from './selling-payment-invoice-entry.response.dto';
import { ResponseSellingPaymentUploadDto } from './selling-payment-upload.response.dto';


export class ResponseSellingPaymentDto {
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

  @ApiProperty({
    example: '1',
    type: Number,
  })
  firmId?: number;

  @ApiProperty({ required: false })
  uploads?: ResponseSellingPaymentUploadDto[];

  @ApiProperty({ required: false })
  invoices?: ResponseSellingPaymentInvoiceEntryDto[];
}
