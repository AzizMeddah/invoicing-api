import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellingArticleQuotationEntryEntity } from '../entities/selling-article-quotation-entry.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class SellingArticleQuotationEntryRepository extends DatabaseAbstractRepository<SellingArticleQuotationEntryEntity> {
  constructor(
    @InjectRepository(SellingArticleQuotationEntryEntity)
    private readonly articleQuotationEntryRepository: Repository<SellingArticleQuotationEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleQuotationEntryRepository, txHost);
  }
}
