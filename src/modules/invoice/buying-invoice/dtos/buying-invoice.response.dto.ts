import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { ResponseCurrencyDto } from 'src/modules/currency/dtos/currency.response.dto';
import { ResponseBankAccountDto } from 'src/modules/bank-account/dtos/bank-account.response.dto';
import { ResponseFirmDto } from 'src/modules/firm/dtos/firm.response.dto';
import { ResponseInterlocutorDto } from 'src/modules/interlocutor/dtos/interlocutor.response.dto';
import { ResponseCabinetDto } from 'src/modules/cabinet/dtos/cabinet.response.dto';

import { IsInstance } from 'class-validator';
import { ResponseBuyingInvoiceUploadDto } from './buying-invoice-upload.response.dto';
import { ResponseBuyingArticleInvoiceEntryDto } from './buying-article-invoice-entry.response.dto';
import { ResponseBuyingInvoiceMetaDataDto } from './buying-invoice-meta-data.response.dto';
import { BUYING_INVOICE_STATUS } from '../enums/buying-invoice-status.enum';
import { ResponseUploadDto } from 'src/common/storage/dtos/upload.response.dto';
import { ResponseFirmBankAccountDto } from 'src/modules/firm-bank-account/dtos/firm-bank-account.response.dto';


export class ResponseBuyingInvoiceDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: faker.finance.transactionDescription(),
    type: String,
  })
  sequential: string;

  @ApiProperty({ required:true })
  //@IsInstance(ResponseUploadDto)
  referenceDoc: ResponseUploadDto|null;

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
    example: BUYING_INVOICE_STATUS.Unpaid,
    enum: BUYING_INVOICE_STATUS,
  })
  status?: BUYING_INVOICE_STATUS;

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

  @ApiProperty({
    example: '120.0',
    type: Number,
  })
  amountPaid: number;

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

  @ApiProperty({ type: () => ResponseCabinetDto })
  cabinet?: ResponseCabinetDto;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  notes?: string;

  @ApiProperty({ type: () => ResponseBuyingArticleInvoiceEntryDto, isArray: true })
  articleInvoiceEntries?: ResponseBuyingArticleInvoiceEntryDto[];

  @ApiProperty({ type: () => ResponseBuyingInvoiceMetaDataDto })
  invoiceMetaData?: ResponseBuyingInvoiceMetaDataDto;

  @ApiProperty({ required: false })
  uploads?: ResponseBuyingInvoiceUploadDto[];

  @ApiProperty({
    example: '1',
    type: Number,
  })
  taxStampId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  taxWithholdingId?: number;
}
