import { ApiProperty } from '@nestjs/swagger';
import { IsInstance, IsInt, IsNumber, IsOptional } from 'class-validator';
import { CreateBuyingInvoiceDto } from './buying-invoice.create.dto';
import { UpdateBuyingInvoiceUploadDto } from './buying-invoice-upload.update.dto';

export class UpdateBuyingInvoiceDto extends CreateBuyingInvoiceDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 1, type: Number })
  @IsNumber()
  referenceDocId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateBuyingInvoiceUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  amountPaid: number;
}
