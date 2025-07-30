import { ApiProperty } from '@nestjs/swagger';
import {  CreateSellingQuotationUploadDto } from './selling-quotation-upload.create.dto';

export class UpdateSellingQuotationUploadDto extends CreateSellingQuotationUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
