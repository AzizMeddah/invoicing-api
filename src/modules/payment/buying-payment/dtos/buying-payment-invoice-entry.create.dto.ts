import { ApiProperty } from '@nestjs/swagger';
import { IsPositive } from 'class-validator';

export class CreateBuyingPaymentInvoiceEntryDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  invoiceId?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  @IsPositive()
  amount?: number;

    @ApiProperty({
      example: '150.0',
      type: Number,
    })
    @IsPositive()
    convertionRate?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  digitAfterComma?: number;
}
