import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { BuyingArticleInvoiceEntryEntity } from '../entities/buying-article-invoice-entry.entity';

@Injectable()
export class BuyingArticleInvoiceEntryRepository extends DatabaseAbstractRepository<BuyingArticleInvoiceEntryEntity> {
  constructor(
    @InjectRepository(BuyingArticleInvoiceEntryEntity)
    private readonly articleInvoiceEntryRepository: Repository<BuyingArticleInvoiceEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleInvoiceEntryRepository, txHost);
  }
}
