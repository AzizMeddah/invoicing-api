import { ApiProperty } from '@nestjs/swagger';
import { ResponseBuyingInvoiceDto } from './buying-invoice.response.dto';

export class ResponseBuyingInvoiceRangeDto {
  @ApiProperty({ type: ResponseBuyingInvoiceDto })
  next: ResponseBuyingInvoiceDto;

  @ApiProperty({ type: ResponseBuyingInvoiceDto })
  previous: ResponseBuyingInvoiceDto;
}
