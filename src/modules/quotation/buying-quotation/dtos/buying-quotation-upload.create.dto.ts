import { ApiProperty } from '@nestjs/swagger';

export class CreateBuyingQuotationUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
