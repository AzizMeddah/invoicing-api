import { ApiProperty } from '@nestjs/swagger';
import { CreateBuyingPaymentInvoiceEntryDto } from './buying-payment-invoice-entry.create.dto';

export class UpdateBuyingPaymentInvoiceEntryDto extends CreateBuyingPaymentInvoiceEntryDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
