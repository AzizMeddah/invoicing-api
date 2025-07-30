import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateBuyingArticleInvoiceEntryTaxDto {
  @ApiProperty({})
  taxId?: number;

  @ApiProperty({})
  @IsOptional()
  articleInvoiceEntryId?: number;
}
