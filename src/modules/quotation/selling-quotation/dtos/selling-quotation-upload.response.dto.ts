import { ApiProperty } from '@nestjs/swagger';

export class ResponseSellingQuotationUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  quotationId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
