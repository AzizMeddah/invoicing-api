import {  forwardRef, Module } from '@nestjs/common';
import { SellingPaymentController } from './controllers/selling-payment.controller';
import { SellingPaymentService } from './services/selling-payment.service';
import { SellingPaymentInvoiceEntryService } from './services/selling-payment-invoice-entry.service';
import { SellingPaymentRepositoryModule } from './repositories/selling-payment.repository.module';
import { SellingPaymentUploadService } from './services/selling-payment-upload.service';
import { StorageModule } from 'src/common/storage/storage.module';
import { CurrencyModule } from 'src/modules/currency/currency.module';
import { SellingInvoiceModule } from 'src/modules/invoice/selling-invoice/selling-invoice.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { PdfModule } from 'src/common/pdf/pdf.module';
import { FirmModule } from 'src/modules/firm/firm.module';
import { CabinetModule } from 'src/modules/cabinet/cabinet.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { UsersModule } from 'src/modules/user/user.module';

@Module({
  controllers: [SellingPaymentController],
  providers: [
    SellingPaymentService,
    SellingPaymentInvoiceEntryService,
    SellingPaymentUploadService


  ],
  exports: [
    SellingPaymentService,
    SellingPaymentInvoiceEntryService,
    SellingPaymentUploadService
    ,SellingPaymentRepositoryModule
  ],
  imports: [
    SellingPaymentRepositoryModule,
    forwardRef(()=>SellingInvoiceModule),
    LoggerModule,
    CurrencyModule,
    StorageModule, 
    PdfModule,
    forwardRef(()=>FirmModule),
    CabinetModule,
    PermissionModule,
    UsersModule

  ],
})
export class SellingPaymentModule {}
