import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { BUYING_INVOICE_STATUS } from '../enums/buying-invoice-status.enum';
import { CreateBuyingInvoiceUploadDto } from './buying-invoice-upload.create.dto';
import { CreateBuyingInvoiceMetaDataDto } from './buying-invoice-meta-data.create.dto';
import { CreateBuyingArticleInvoiceEntryDto } from './buying-article-invoice-entry.create.dto';



export class CreateBuyingInvoiceDto {


  @ApiProperty({
    example: "INV-001",
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
    example: BUYING_INVOICE_STATUS.Unpaid,
    enum: BUYING_INVOICE_STATUS,
  })
  @IsOptional()
  @IsEnum(BUYING_INVOICE_STATUS)
  status?: BUYING_INVOICE_STATUS;

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

  @ApiProperty({ type: () => CreateBuyingArticleInvoiceEntryDto, isArray: true })
  @IsOptional()
  articleInvoiceEntries?: CreateBuyingArticleInvoiceEntryDto[];

  @ApiProperty({ type: () => CreateBuyingInvoiceMetaDataDto })
  @IsOptional()
  invoiceMetaData?: CreateBuyingInvoiceMetaDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateBuyingInvoiceUploadDto[];

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  quotationId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  taxStampId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  taxWithholdingId?: number;
}
