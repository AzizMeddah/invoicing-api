import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { SELLING_QUOTATION_STATUS } from '../enums/selling-quotation-status.enum';
import { CreateSellingArticleQuotationEntryDto } from './selling-article-quotation-entry.create.dto';
import { CreateSellingQuotationMetaDataDto } from './selling-quotation-meta-data.create.dto';
import { CreateSellingQuotationUploadDto } from './selling-quotation-upload.create.dto';


export class CreateSellingQuotationDto {
  @ApiProperty({ example: faker.date.anytime() })
  date?: Date;

  @ApiProperty({ example: faker.date.anytime() })
  dueDate?: Date;

  @ApiProperty({
    example: faker.finance.transactionDescription(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  object?: string;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  generalConditions?: string;

  @ApiProperty({
    example: SELLING_QUOTATION_STATUS.Draft,
    enum: SELLING_QUOTATION_STATUS,
  })
  @IsOptional()
  @IsEnum(SELLING_QUOTATION_STATUS)
  status?: SELLING_QUOTATION_STATUS;

  @ApiProperty({
    example: '0.1',
    type: Number,
  })
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: DISCOUNT_TYPES.PERCENTAGE, enum: DISCOUNT_TYPES })
  @IsOptional()
  @IsEnum(DISCOUNT_TYPES)
  discount_type?: DISCOUNT_TYPES;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  currencyId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  firmId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  interlocutorId?: number;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  notes?: string;

  @ApiProperty({ type: () => CreateSellingArticleQuotationEntryDto, isArray: true })
  @IsOptional()
  articleQuotationEntries?: CreateSellingArticleQuotationEntryDto[];

  @ApiProperty({ type: () => CreateSellingQuotationMetaDataDto })
  @IsOptional()
  quotationMetaData?: CreateSellingQuotationMetaDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateSellingQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoiceId?: number;
}
