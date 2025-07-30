import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateSellingQuotationDto } from './selling-quotation.create.dto';
import {  UpdateSellingQuotationUploadDto } from './selling-quotation-upload.update.dto';

export class UpdateSellingQuotationDto extends CreateSellingQuotationDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateSellingQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  createInvoice: boolean;
}
