import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingInvoiceUploadEntity } from '../entities/selling-invoice-file.entity';

@Injectable()
export class SellingInvoiceUploadRepository extends DatabaseAbstractRepository<SellingInvoiceUploadEntity> {
  constructor(
    @InjectRepository(SellingInvoiceUploadEntity)
    private readonly invoiceUploadRespository: Repository<SellingInvoiceUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(invoiceUploadRespository, txHost);
  }
}
