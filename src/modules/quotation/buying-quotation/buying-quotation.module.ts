import { forwardRef, Module } from '@nestjs/common';
import { BuyingQuotationService } from './services/buying-quotation.service';
import { BuyingQuotationController } from './controllers/buying-quotation.controller';
import { BuyingQuotationRepositoryModule } from './repositories/buying-quotation.repository.module';

import { BuyingArticleQuotationEntryService } from './services/buying-article-quotation-entry.service';
import { BuyingArticleQuotationEntryTaxService } from './services/buying-article-quotation-entry-tax.service';
import { BuyingQuotationMetaDataService } from './services/buying-quotation-meta-data.service';
import { BuyingQuotationUploadService } from './services/buying-quotation-upload.service';
import { QuotationSequenceService } from '../selling-quotation/services/quotation-sequence.service';
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
import { BuyingInvoiceModule } from 'src/modules/invoice/buying-invoice/buying-invoice.module';
import { FirmBankAccountModule } from 'src/modules/firm-bank-account/firm-bank-account.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { UsersModule } from 'src/modules/user/user.module';


@Module({
  controllers: [BuyingQuotationController],
  providers: [
    BuyingQuotationService,
    BuyingArticleQuotationEntryService,
    BuyingArticleQuotationEntryTaxService,
    BuyingQuotationMetaDataService,
    BuyingQuotationUploadService,
    


  ],
  exports: [
    BuyingQuotationService,
    BuyingQuotationRepositoryModule
  ],
  imports: [
    BuyingQuotationRepositoryModule,

    BuyingInvoiceModule,
    ArticleModule,
    AppConfigModule,
    FirmBankAccountModule,
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
    UsersModule
  ],
})

export class BuyingQuotationModule {}
