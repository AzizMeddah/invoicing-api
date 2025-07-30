import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellingPaymentEntity } from './entities/selling-payment.entity';
import { SellingPaymentRepository } from './repository/selling-payment.repository';
import { SellingPaymentInvoiceEntryEntity } from './entities/selling-payment-invoice-entry.entity';
import { SellingPaymentInvoiceEntryRepository } from './repository/selling-payment-invoice-entry.repository';
import { SellingPaymentUploadEntity } from './entities/selling-payment-file.entity';
import { SellingPaymentUploadRepository } from './repository/selling-payment-file.repository';

@Module({
  controllers: [],
  providers: [
    SellingPaymentRepository,
    SellingPaymentInvoiceEntryRepository,
    SellingPaymentUploadRepository
  ],
  exports: [
    SellingPaymentRepository,
    SellingPaymentInvoiceEntryRepository,
    SellingPaymentUploadRepository

  ],
  imports: [
    TypeOrmModule.forFeature([
      SellingPaymentEntity,
      SellingPaymentInvoiceEntryEntity,
      SellingPaymentUploadEntity
    ]),

  ],
})
export class SellingPaymentRepositoryModule {}
