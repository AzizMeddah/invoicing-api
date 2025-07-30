import { forwardRef, Module } from '@nestjs/common';
import { BuyingPaymentController} from './controllers/buying-payment.controller';
import { BuyingPaymentService } from './services/buying-payment.service';
import { BuyingPaymentInvoiceEntryService} from './services/buying-payment-invoice-entry.service';
import { BuyingPaymentRepositoryModule } from './repositories/buying-payment.repository.module';
import { BuyingPaymentUploadService } from './services/buying-payment-upload.service';
import { CurrencyModule } from 'src/modules/currency/currency.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { BuyingInvoiceModule } from 'src/modules/invoice/buying-invoice/buying-invoice.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { PdfModule } from 'src/common/pdf/pdf.module';
import { FirmModule } from 'src/modules/firm/firm.module';
import { CabinetModule } from 'src/modules/cabinet/cabinet.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { UsersModule } from 'src/modules/user/user.module';

@Module({
  controllers: [BuyingPaymentController],
  providers: [
    BuyingPaymentService,
    BuyingPaymentUploadService,
    BuyingPaymentInvoiceEntryService,

  ],
  exports: [
    BuyingPaymentService,
    BuyingPaymentInvoiceEntryService,
    BuyingPaymentUploadService,
    BuyingPaymentRepositoryModule,

  ],
  imports: [
    BuyingPaymentRepositoryModule,
    forwardRef(()=>BuyingInvoiceModule),

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
export class BuyingPaymentModule {}
