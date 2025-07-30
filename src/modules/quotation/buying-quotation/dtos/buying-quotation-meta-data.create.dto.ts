import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateBuyingQuotationMetaDataDto {
  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  showArticleDescription?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  hasBankingDetails?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  hasGeneralConditions?: boolean;

  @ApiProperty({ example: true, type: Object })
  @IsOptional()
  taxSummary?: any;
}
