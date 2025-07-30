import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyingArticleQuotationEntryEntity } from '../entities/buying-article-quotation-entry.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class BuyingArticleQuotationEntryRepository extends DatabaseAbstractRepository<BuyingArticleQuotationEntryEntity> {
  constructor(
    @InjectRepository(BuyingArticleQuotationEntryEntity)
    private readonly articleQuotationEntryRepository: Repository<BuyingArticleQuotationEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleQuotationEntryRepository, txHost);
  }
}
