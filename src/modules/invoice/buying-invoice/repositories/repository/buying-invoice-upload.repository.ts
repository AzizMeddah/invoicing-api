import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { BuyingInvoiceUploadEntity,  } from '../entities/buying-invoice-file.entity';

@Injectable()
export class BuyingInvoiceUploadRepository extends DatabaseAbstractRepository<BuyingInvoiceUploadEntity> {
  constructor(
    @InjectRepository(BuyingInvoiceUploadEntity)
    private readonly invoiceUploadRespository: Repository<BuyingInvoiceUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(invoiceUploadRespository, txHost);
  }
}
