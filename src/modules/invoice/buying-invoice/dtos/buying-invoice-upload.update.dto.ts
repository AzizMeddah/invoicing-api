import { ApiProperty } from '@nestjs/swagger';
import { CreateBuyingInvoiceUploadDto } from './buying-invoice-upload.create.dto';

export class UpdateBuyingInvoiceUploadDto extends CreateBuyingInvoiceUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
