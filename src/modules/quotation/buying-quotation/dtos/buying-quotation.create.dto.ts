import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  IsNotEmpty,
  Matches,
  MinLength
} from 'class-validator';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { BUYING_QUOTATION_STATUS } from '../enums/buying-quotation-status.enum';
import { CreateBuyingQuotationUploadDto } from './buying-quotation-upload.create.dto';
import { CreateBuyingArticleQuotationEntryDto } from './buying-article-quotation-entry.create.dto';
import { CreateBuyingQuotationMetaDataDto } from './buying-quotation-meta-data.create.dto';

export class CreateBuyingQuotationDto {


  @ApiProperty({
    example:"QUO-001",
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9\-]+$/, {
    message: 'Le numéro séquentiel ne peut contenir que des lettres majuscules, des chiffres et des tirets.',
  })
  @MinLength(5, { message: 'Le numéro séquentiel doit contenir au moins 5 caractères.' })
  @MaxLength(20, { message: 'Le numéro séquentiel ne peut pas dépasser 20 caractères.' })
  sequential: string;

  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  referenceDocId: number;
  

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
    example: BUYING_QUOTATION_STATUS.Draft,
    enum: BUYING_QUOTATION_STATUS,
  })
  @IsOptional()
  @IsEnum(BUYING_QUOTATION_STATUS)
  status?: BUYING_QUOTATION_STATUS;

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

  @ApiProperty({ type: () => CreateBuyingArticleQuotationEntryDto, isArray: true })
  @IsOptional()
  articleQuotationEntries?: CreateBuyingArticleQuotationEntryDto[];

  @ApiProperty({ type: () => CreateBuyingQuotationMetaDataDto })
  @IsOptional()
  quotationMetaData?: CreateBuyingQuotationMetaDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateBuyingQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoiceId?: number;


}