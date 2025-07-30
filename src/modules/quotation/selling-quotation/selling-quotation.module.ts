import {  forwardRef, Module } from '@nestjs/common';
import { SellingQuotationService } from './services/selling-quotation.service';
import { SellingQuotationController } from './controllers/selling-quotation.controller';

import { SellingQuotationRepositoryModule } from './repositories/selling-quotation.repository.module';

import {  SellingArticleQuotationEntryService } from './services/selling-article-quotation-entry.service';

import { SellingQuotationMetaDataService } from './services/selling-quotation-meta-data.service';
import { SellingArticleQuotationEntryTaxService } from './services/selling-article-quotation-entry-tax.service';
import { SellingQuotationUploadService } from './services/selling-quotation-upload.service';
import { AppConfigModule } from 'src/common/app-config/app-config.module';
import { CalculationsModule } from 'src/common/calculations/calculations.module';
import { GatewaysModule } from 'src/common/gateways/gateways.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { PdfModule } from 'src/common/pdf/pdf.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { ArticleModule } from 'src/modules/article/article.module';
import { BankAccountModule } from 'src/modules/bank-account/bank-account.module';
import { CurrencyModule } from 'src/modules/currency/currency.module';
import { FirmModule } from 'src/modules/firm/firm.module';
import { InterlocutorModule } from 'src/modules/interlocutor/Interlocutor.module';
import { TaxModule } from 'src/modules/tax/tax.module';
import { SellingInvoiceModule } from 'src/modules/invoice/selling-invoice/selling-invoice.module';
import { QuotationSequenceService } from './services/quotation-sequence.service';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { UsersModule } from 'src/modules/user/user.module';
import { CabinetModule } from 'src/modules/cabinet/cabinet.module';


@Module({
  controllers: [
    SellingQuotationController
  ],
  providers: [
    SellingQuotationService,
    SellingArticleQuotationEntryService,
    SellingArticleQuotationEntryTaxService,
    SellingQuotationMetaDataService,
    SellingQuotationUploadService,
    QuotationSequenceService,
  ],
  exports: [
    SellingQuotationService,
    SellingQuotationRepositoryModule,
  ],
  imports: [
    SellingQuotationRepositoryModule,
    SellingInvoiceModule,
    ArticleModule,
    AppConfigModule,
    BankAccountModule,
    CurrencyModule,
    forwardRef(()=>FirmModule),
    forwardRef(()=>InterlocutorModule),
    TaxModule,
    PdfModule,
    GatewaysModule,
    CalculationsModule,
    StorageModule,
    LoggerModule,
    PermissionModule,
    UsersModule,
    CabinetModule
  ],
})
export class SellingQuotationModule {}
