import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingArticleInvoiceEntryTaxEntity } from '../entities/selling-article-invoice-entry-tax.entity';

@Injectable()
export class SellingArticleInvoiceEntryTaxRepository extends DatabaseAbstractRepository<SellingArticleInvoiceEntryTaxEntity> {
  constructor(
    @InjectRepository(SellingArticleInvoiceEntryTaxEntity)
    private readonly articleInvoiceEntryTaxRepository: Repository<SellingArticleInvoiceEntryTaxEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleInvoiceEntryTaxRepository, txHost);
  }
}
