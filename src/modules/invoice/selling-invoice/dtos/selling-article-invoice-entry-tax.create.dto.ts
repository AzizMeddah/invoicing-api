import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateSellingArticleInvoiceEntryTaxDto {
  @ApiProperty({})
  taxId?: number;

  @ApiProperty({})
  @IsOptional()
  articleInvoiceEntryId?: number;
}
