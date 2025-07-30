import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateSellingInvoiceDto } from './selling-invoice.create.dto';
import { UpdateSellingInvoiceUploadDto } from './selling-invoice-upload.update.dto';

export class UpdateSellingInvoiceDto extends CreateSellingInvoiceDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateSellingInvoiceUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  amountPaid: number;
}
