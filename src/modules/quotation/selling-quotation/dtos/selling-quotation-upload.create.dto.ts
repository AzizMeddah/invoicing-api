import { ApiProperty } from '@nestjs/swagger';

export class CreateSellingQuotationUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
