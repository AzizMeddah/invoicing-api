import {  forwardRef, Module } from '@nestjs/common';
import { SellingInvoiceController } from './controllers/selling-invoice.controller';
import { SellingInvoiceService } from './services/selling-invoice.service';
import { SellingInvoiceRepositoryModule } from './repositories/selling-invoice.repository.module';
import { InvoiceSequenceService } from './services/invoice-sequence.service';
import { SellingArticleInvoiceEntryService } from './services/selling-article-invoice-entry.service';
import { SellingArticleInvoiceEntryTaxService } from './services/selling-article-invoice-entry-tax.service';
import { SellingInvoiceMetaDataService } from './services/selling-invoice-meta-data.service';
import { SellingInvoiceUploadService } from './services/selling-invoice-upload.service';
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
import { SellingPaymentModule } from 'src/modules/payment/selling-payment/selling-payment.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { UsersModule } from 'src/modules/user/user.module';
import { CabinetService } from 'src/modules/cabinet/services/cabinet.service';
import { CabinetModule } from 'src/modules/cabinet/cabinet.module';


@Module({
  controllers: [
    SellingInvoiceController
  ],
  providers: [
    SellingInvoiceService,
    SellingArticleInvoiceEntryService,
    SellingArticleInvoiceEntryTaxService,
    SellingInvoiceMetaDataService,
    SellingInvoiceUploadService,
    InvoiceSequenceService,
  ],
  exports: [
    SellingInvoiceService,
    SellingInvoiceRepositoryModule,

  ],
  imports: [

    SellingInvoiceRepositoryModule,

    ArticleModule,
    AppConfigModule,
    BankAccountModule,
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
    forwardRef(()=>SellingPaymentModule),
    PermissionModule,
    UsersModule,
    CabinetModule
  ],
})
export class SellingInvoiceModule {}
