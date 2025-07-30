import { ApiProperty } from '@nestjs/swagger';
import { IsInstance,IsInt,IsOptional } from 'class-validator';
import { CreateBuyingQuotationDto } from './buying-quotation.create.dto';
import { UpdateBuyingQuotationUploadDto } from './buying-quotation-upload.update.dto';

export class UpdateBuyingQuotationDto extends CreateBuyingQuotationDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required:true })
  @IsInt()
  referenceDocId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateBuyingQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  createInvoice: boolean;
}
