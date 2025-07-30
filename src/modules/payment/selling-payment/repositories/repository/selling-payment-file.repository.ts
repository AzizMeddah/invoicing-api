import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingPaymentUploadEntity } from '../entities/selling-payment-file.entity';

@Injectable()
export class SellingPaymentUploadRepository extends DatabaseAbstractRepository<SellingPaymentUploadEntity> {
  constructor(
    @InjectRepository(SellingPaymentUploadEntity)
    private readonly sellingPaymentInvoiceEntryRepository: Repository<SellingPaymentUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(sellingPaymentInvoiceEntryRepository, txHost);
  }
}
