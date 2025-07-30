import { ApiProperty } from '@nestjs/swagger';

export class CreateBuyingPaymentUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
