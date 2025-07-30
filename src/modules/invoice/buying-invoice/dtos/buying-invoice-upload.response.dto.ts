import { ApiProperty } from '@nestjs/swagger';

export class ResponseBuyingInvoiceUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  invoiceId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
