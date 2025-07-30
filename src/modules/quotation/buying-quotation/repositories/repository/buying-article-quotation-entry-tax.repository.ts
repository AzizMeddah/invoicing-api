import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyingArticleQuotationEntryTaxEntity } from '../entities/buying-article-quotation-entry-tax.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class BuyingArticleQuotationEntryTaxRepository extends DatabaseAbstractRepository<BuyingArticleQuotationEntryTaxEntity> {
  constructor(
    @InjectRepository(BuyingArticleQuotationEntryTaxEntity)
    private readonly articleQuotationEntryTaxRepository: Repository<BuyingArticleQuotationEntryTaxEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleQuotationEntryTaxRepository, txHost);
  }
}
