import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingArticleInvoiceEntryEntity } from '../entities/selling-article-invoice-entry.entity';

@Injectable()
export class SellingArticleInvoiceEntryRepository extends DatabaseAbstractRepository<SellingArticleInvoiceEntryEntity> {
  constructor(
    @InjectRepository(SellingArticleInvoiceEntryEntity)
    private readonly articleInvoiceEntryRepository: Repository<SellingArticleInvoiceEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleInvoiceEntryRepository, txHost);
  }
}
