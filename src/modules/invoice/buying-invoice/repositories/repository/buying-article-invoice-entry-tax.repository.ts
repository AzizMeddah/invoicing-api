import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { BuyingArticleInvoiceEntryTaxEntity } from '../entities/buying-article-invoice-entry-tax.entity';

@Injectable()
export class BuyingArticleInvoiceEntryTaxRepository extends DatabaseAbstractRepository<BuyingArticleInvoiceEntryTaxEntity> {
  constructor(
    @InjectRepository(BuyingArticleInvoiceEntryTaxEntity)
    private readonly articleInvoiceEntryTaxRepository: Repository<BuyingArticleInvoiceEntryTaxEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleInvoiceEntryTaxRepository, txHost);
  }
}
