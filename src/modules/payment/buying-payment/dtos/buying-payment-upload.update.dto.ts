import { ApiProperty } from '@nestjs/swagger';
import { CreateBuyingPaymentUploadDto } from './buying-payment-upload.create.dto';

export class UpdateBuyingPaymentUploadDto extends CreateBuyingPaymentUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
