import { ApiProperty } from '@nestjs/swagger';
import { ResponseSellingInvoiceDto } from './selling-invoice.response.dto';

export class ResponseSellingInvoiceRangeDto {
  @ApiProperty({ type: ResponseSellingInvoiceDto })
  next: ResponseSellingInvoiceDto;

  @ApiProperty({ type: ResponseSellingInvoiceDto })
  previous: ResponseSellingInvoiceDto;
}
