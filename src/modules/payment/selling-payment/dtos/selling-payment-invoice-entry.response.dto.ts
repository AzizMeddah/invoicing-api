import { ApiProperty } from '@nestjs/swagger';

export class ResponseSellingPaymentInvoiceEntryDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  paymentId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  invoiceId?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  amount?: number;


    @ApiProperty({
      example: '150.0',
      type: Number,
    })
    convertionRate?: number;
}
