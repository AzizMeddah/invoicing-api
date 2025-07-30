import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { ResponseFirmDto } from 'src/modules/firm/dtos/firm.response.dto';
import { ResponseInterlocutorDto } from 'src/modules/interlocutor/dtos/interlocutor.response.dto';
import { ResponseCabinetDto } from 'src/modules/cabinet/dtos/cabinet.response.dto';
import { ResponseCurrencyDto } from 'src/modules/currency/dtos/currency.response.dto';
import { ResponseBankAccountDto } from 'src/modules/bank-account/dtos/bank-account.response.dto';
import { ResponseSellingQuotationUploadDto } from './selling-quotation-upload.response.dto';
import { ResponseSellingQuotationMetaDataDto } from './selling-quotation-meta-data.response.dto';
import { ResponseSellingArticleQuotationEntryDto } from './selling-article-quotation-entry.response.dto';
import { SELLING_QUOTATION_STATUS } from '../enums/selling-quotation-status.enum';



export class ResponseSellingQuotationDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: faker.finance.transactionDescription(),
    type: String,
  })
  sequential: string;

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
    example: SELLING_QUOTATION_STATUS.Draft,
    enum: SELLING_QUOTATION_STATUS,
  })
  status?: SELLING_QUOTATION_STATUS;

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

  @ApiProperty({ type: () => ResponseBankAccountDto })
  bankAccount?: ResponseBankAccountDto;

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

  @ApiProperty({ type: () => ResponseSellingArticleQuotationEntryDto, isArray: true })
  articleQuotationEntries?: ResponseSellingArticleQuotationEntryDto[];

  @ApiProperty({ type: () => ResponseSellingQuotationMetaDataDto })
  quotationMetaData?: ResponseSellingQuotationMetaDataDto;

  @ApiProperty({ required: false })
  uploads?: ResponseSellingQuotationUploadDto[];

  @ApiProperty({ required: false })
  invoiceId?: number;
}
