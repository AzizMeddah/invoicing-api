import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellingArticleQuotationEntryTaxEntity } from '../entities/selling-article-quotation-entry-tax.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class SellingArticleQuotationEntryTaxRepository extends DatabaseAbstractRepository<SellingArticleQuotationEntryTaxEntity> {
  constructor(
    @InjectRepository(SellingArticleQuotationEntryTaxEntity)
    private readonly articleQuotationEntryTaxRepository: Repository<SellingArticleQuotationEntryTaxEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleQuotationEntryTaxRepository, txHost);
  }
}
