import { ApiProperty } from '@nestjs/swagger';
import {  CreateSellingPaymentDto } from './selling-payment.create.dto';
import { IsOptional } from 'class-validator';
import { UpdateSellingPaymentInvoiceEntryDto } from './selling-payment-invoice-entry.update.dto';
import { UpdateSellingPaymentUploadDto } from './selling-payment-upload.update.dto';


export class UpdateSellingPaymentDto extends CreateSellingPaymentDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateSellingPaymentUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoices?: UpdateSellingPaymentInvoiceEntryDto[];
}
