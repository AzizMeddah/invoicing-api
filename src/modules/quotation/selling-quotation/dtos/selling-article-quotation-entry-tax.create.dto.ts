import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateSellingArticleQuotationEntryTaxDto {
  @ApiProperty({})
  taxId?: number;

  @ApiProperty({})
  @IsOptional()
  articleQuotationEntryId?: number;
}
