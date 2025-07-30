import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { BuyingPaymentUploadEntity } from '../entities/buying-payment-file.entity';

@Injectable()
export class BuyingPaymentUploadRepository extends DatabaseAbstractRepository<BuyingPaymentUploadEntity> {
  constructor(
    @InjectRepository(BuyingPaymentUploadEntity)
    private readonly buyingPaymentInvoiceEntryRepository: Repository<BuyingPaymentUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(buyingPaymentInvoiceEntryRepository, txHost);
  }
}
