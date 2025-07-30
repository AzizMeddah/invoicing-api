import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { BuyingPaymentInvoiceEntryEntity } from '../entities/buying-payment-invoice-entry.entity';

@Injectable()
export class BuyingPaymentInvoiceEntryRepository extends DatabaseAbstractRepository<BuyingPaymentInvoiceEntryEntity> {
  constructor(
    @InjectRepository(BuyingPaymentInvoiceEntryEntity)
    private readonly buyingPaymentInvoiceEntryRepository: Repository<BuyingPaymentInvoiceEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(buyingPaymentInvoiceEntryRepository, txHost);
  }
}
