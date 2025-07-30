import { ApiProperty } from '@nestjs/swagger';
import { CreateSellingPaymentUploadDto } from './selling-payment-upload.create.dto';

export class UpdateSellingPaymentUploadDto extends CreateSellingPaymentUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
