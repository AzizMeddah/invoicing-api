import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { ResponseFirmDto } from 'src/modules/firm/dtos/firm.response.dto';
import { ResponseInterlocutorDto } from 'src/modules/interlocutor/dtos/interlocutor.response.dto';
import { ResponseCabinetDto } from 'src/modules/cabinet/dtos/cabinet.response.dto';
import { ResponseCurrencyDto } from 'src/modules/currency/dtos/currency.response.dto';
import { ResponseBankAccountDto } from 'src/modules/bank-account/dtos/bank-account.response.dto';
import { BUYING_QUOTATION_STATUS } from '../enums/buying-quotation-status.enum';
import { ResponseBuyingQuotationUploadDto } from './buying-quotation-upload.response.dto';
import { ResponseBuyingQuotationMetaDataDto } from './buying-quotation-meta-data.response.dto';
import { ResponseBuyingArticleQuotationEntryDto } from './buying-article-quotation-entry.response.dto';
import { ResponseUploadDto } from 'src/common/storage/dtos/upload.response.dto';
import { ResponseFirmBankAccountDto } from 'src/modules/firm-bank-account/dtos/firm-bank-account.response.dto';



export class ResponseBuyingQuotationDto{
@ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    type: String,
  })
  sequential: string;

  @ApiProperty({ type: () => ResponseUploadDto })
  referenceDoc: ResponseUploadDto;

  @ApiProperty({ example: faker.date.anytime(), type: Date })
  date?: Date;

  @ApiProperty({ example: faker.date.anytime(), type: Date })
  dueDate?: Date;

  @ApiProperty({
    example: faker.finance.transactionDescription(),
    type: String,
  })
  object?: string;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  generalConditions?: string;

  @ApiProperty({
    example: BUYING_QUOTATION_STATUS.Draft,
    enum: BUYING_QUOTATION_STATUS,
  })
  status?: BUYING_QUOTATION_STATUS;

  @ApiProperty({
    example: '0.1',
    type: Number,
  })
  discount?: number;

  @ApiProperty({ example: DISCOUNT_TYPES.PERCENTAGE, enum: DISCOUNT_TYPES })
  discount_type: DISCOUNT_TYPES;

  @ApiProperty({
    example: '125.35',
    type: Number,
  })
  subTotal?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  total?: number;

  @ApiProperty({ type: () => ResponseCurrencyDto })
  currency?: ResponseCurrencyDto;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  currencyId?: number;

  @ApiProperty({ type: () => ResponseFirmBankAccountDto })
  bankAccount?: ResponseFirmBankAccountDto;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  bankAccountId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  firmId?: number;

  @ApiProperty({ type: () => ResponseFirmDto })
  firm?: ResponseFirmDto;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  interlocutorId?: number;

  @ApiProperty({ type: () => ResponseInterlocutorDto })
  interlocutor?: ResponseInterlocutorDto;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  cabinetId?: number;

  @ApiProperty({ type: () => ResponseFirmDto })
  cabinet?: ResponseCabinetDto;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  notes?: string;

  @ApiProperty({ type: () => ResponseBuyingArticleQuotationEntryDto, isArray: true })
  articleQuotationEntries?: ResponseBuyingArticleQuotationEntryDto[];

  @ApiProperty({ type: () => ResponseBuyingQuotationMetaDataDto })
  quotationMetaData?: ResponseBuyingQuotationMetaDataDto;

  @ApiProperty({ required: false })
  uploads?: ResponseBuyingQuotationUploadDto[];

  @ApiProperty({ required: false })
  invoiceId?: number;


}