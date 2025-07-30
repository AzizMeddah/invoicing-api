import { ApiProperty } from '@nestjs/swagger';

export class CreateBuyingInvoiceUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
