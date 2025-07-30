import { ApiProperty } from '@nestjs/swagger';
import { CreateBuyingQuotationUploadDto} from './buying-quotation-upload.create.dto';

export class UpdateBuyingQuotationUploadDto extends CreateBuyingQuotationUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
