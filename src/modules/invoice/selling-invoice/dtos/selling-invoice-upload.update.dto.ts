import { ApiProperty } from '@nestjs/swagger';
import { CreateSellingInvoiceUploadDto } from './selling-invoice-upload.create.dto';

export class UpdateSellingInvoiceUploadDto extends CreateSellingInvoiceUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
