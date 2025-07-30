import {  forwardRef, Module } from '@nestjs/common';
import { BuyingInvoiceController } from './controllers/buying-invoice.controller';
import { BuyingInvoiceService } from './services/buying-invoice.service';
import { BuyingInvoiceRepositoryModule } from './repositories/buying-invoice.repository.module';
import { BuyingArticleInvoiceEntryService } from './services/buying-article-invoice-entry.service';
import { BuyingArticleInvoiceEntryTaxService } from './services/buying-article-invoice-entry-tax.service';
import { BuyingInvoiceMetaDataService } from './services/buying-invoice-meta-data.service';
import { BuyingInvoiceUploadService } from './services/buying-invoice-upload.service';
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
import { TaxWithholdingModule } from 'src/modules/tax-withholding/tax-withholding.module';
import { TaxModule } from 'src/modules/tax/tax.module';
import { InvoiceSequenceService } from '../selling-invoice/services/invoice-sequence.service';
import { FirmBankAccountModule } from 'src/modules/firm-bank-account/firm-bank-account.module';
import { BuyingPaymentModule } from 'src/modules/payment/buying-payment/buying-payment.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { UsersModule } from 'src/modules/user/user.module';


@Module({
  controllers: [
    BuyingInvoiceController
  ],
  providers: [
    BuyingInvoiceService,
    BuyingArticleInvoiceEntryService,
    BuyingArticleInvoiceEntryTaxService,
    BuyingInvoiceMetaDataService,
    BuyingInvoiceUploadService,

  ],
  exports: [
    BuyingInvoiceService,
    BuyingInvoiceRepositoryModule,
  ],
  imports: [
    BuyingInvoiceRepositoryModule,
    ArticleModule,
    AppConfigModule,
    FirmBankAccountModule,
    CurrencyModule,
    forwardRef(()=>FirmModule),
    forwardRef(()=>InterlocutorModule),
    TaxModule,
    TaxWithholdingModule,
    PdfModule,
    GatewaysModule,
    CalculationsModule,
    StorageModule,
    LoggerModule,
    forwardRef(()=>BuyingPaymentModule),
    PermissionModule,
    UsersModule
  ],
})
export class BuyingInvoiceModule {}
