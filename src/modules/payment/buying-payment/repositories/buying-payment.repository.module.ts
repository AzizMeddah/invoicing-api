import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyingPaymentEntity } from './entities/buying-payment.entity';
import { BuyingPaymentRepository } from './repository/buying-payment.repository';
import { BuyingPaymentInvoiceEntryEntity } from './entities/buying-payment-invoice-entry.entity';
import { BuyingPaymentInvoiceEntryRepository } from './repository/buying-payment-invoice-entry.repository';
import { BuyingPaymentUploadRepository } from './repository/buying-payment-file.repository';
import { BuyingPaymentUploadEntity } from './entities/buying-payment-file.entity';

@Module({
  controllers: [],
  providers: [
    BuyingPaymentRepository,
    BuyingPaymentInvoiceEntryRepository,
    BuyingPaymentUploadRepository,
  ],
  exports: [
    BuyingPaymentRepository,
    BuyingPaymentInvoiceEntryRepository,
    BuyingPaymentUploadRepository

  ],
  imports: [
    TypeOrmModule.forFeature([
      BuyingPaymentEntity,
      BuyingPaymentInvoiceEntryEntity,
      BuyingPaymentUploadEntity,
    ]),

  ],
})
export class BuyingPaymentRepositoryModule {}
