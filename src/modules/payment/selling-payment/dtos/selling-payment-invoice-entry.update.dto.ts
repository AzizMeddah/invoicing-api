import { ApiProperty } from '@nestjs/swagger';
import { CreateSellingPaymentInvoiceEntryDto } from './selling-payment-invoice-entry.create.dto';

export class UpdateSellingPaymentInvoiceEntryDto extends CreateSellingPaymentInvoiceEntryDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
