import { ApiProperty } from '@nestjs/swagger';
import {  CreateBuyingPaymentDto } from './buying-payment.create.dto';
import { IsOptional } from 'class-validator';
import { UpdateBuyingPaymentUploadDto } from './buying-payment-upload.update.dto';
import { UpdateBuyingPaymentInvoiceEntryDto } from './buying-payment-invoice-entry.update.dto';


export class UpdateBuyingPaymentDto extends CreateBuyingPaymentDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateBuyingPaymentUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoices?: UpdateBuyingPaymentInvoiceEntryDto[];
}
