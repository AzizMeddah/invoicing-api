import { ApiProperty } from '@nestjs/swagger';

export class ResponseBuyingPaymentUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  paymentId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
