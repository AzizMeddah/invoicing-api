import { ApiProperty } from '@nestjs/swagger';

export class ResponseBuyingQuotationMetaDataDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: true, type: Boolean })

  @ApiProperty({ example: true, type: Boolean })

  @ApiProperty({ example: true, type: Boolean })
  showArticleDescription: boolean;

  @ApiProperty({ example: true, type: Boolean })
  hasBankingDetails?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  hasGeneralConditions?: boolean;

  @ApiProperty({ example: {}, type: Object })
  taxSummary: any;
}
