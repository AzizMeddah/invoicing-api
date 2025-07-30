import { ApiProperty } from '@nestjs/swagger';

export class CreateSellingInvoiceUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
