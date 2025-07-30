import { ApiProperty } from '@nestjs/swagger';

export class CreateSellingPaymentUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
