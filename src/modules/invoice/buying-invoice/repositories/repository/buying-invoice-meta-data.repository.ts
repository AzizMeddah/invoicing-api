import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { BuyingInvoiceMetaDataEntity, } from '../entities/buying-invoice-meta-data.entity';

@Injectable()
export class BuyingInvoiceMetaDataRepository extends DatabaseAbstractRepository<BuyingInvoiceMetaDataEntity> {
  constructor(
    @InjectRepository(BuyingInvoiceMetaDataEntity)
    private readonly invoiceMetaDataRespository: Repository<BuyingInvoiceMetaDataEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(invoiceMetaDataRespository, txHost);
  }
}
