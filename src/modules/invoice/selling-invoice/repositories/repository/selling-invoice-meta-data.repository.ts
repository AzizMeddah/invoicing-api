import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingInvoiceMetaDataEntity } from '../entities/selling-invoice-meta-data.entity';

@Injectable()
export class SellingInvoiceMetaDataRepository extends DatabaseAbstractRepository<SellingInvoiceMetaDataEntity> {
  constructor(
    @InjectRepository(SellingInvoiceMetaDataEntity)
    private readonly invoiceMetaDataRespository: Repository<SellingInvoiceMetaDataEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(invoiceMetaDataRespository, txHost);
  }
}
