import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingPaymentInvoiceEntryEntity } from '../entities/selling-payment-invoice-entry.entity';

@Injectable()
export class SellingPaymentInvoiceEntryRepository extends DatabaseAbstractRepository<SellingPaymentInvoiceEntryEntity> {
  constructor(
    @InjectRepository(SellingPaymentInvoiceEntryEntity)
    private readonly sellingPaymentInvoiceEntryRepository: Repository<SellingPaymentInvoiceEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(sellingPaymentInvoiceEntryRepository, txHost);
  }
}
