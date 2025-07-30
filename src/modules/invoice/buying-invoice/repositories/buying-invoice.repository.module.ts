import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyingInvoiceRepository } from './repository/buying-invoice.repository';
import { BuyingInvoiceEntity } from './entities/buying-invoice.entity';
import { BuyingArticleInvoiceEntryEntity } from './entities/buying-article-invoice-entry.entity';
import { BuyingArticleInvoiceEntryRepository } from './repository/buying-article-invoice-entry.repository';
import { BuyingArticleInvoiceEntryTaxRepository } from './repository/buying-article-invoice-entry-tax.repository';
import { BuyingInvoiceMetaDataRepository } from './repository/buying-invoice-meta-data.repository';
import { BuyingInvoiceUploadRepository } from './repository/buying-invoice-upload.repository';
import { BuyingArticleInvoiceEntryTaxEntity } from './entities/buying-article-invoice-entry-tax.entity';
import { BuyingInvoiceUploadEntity } from './entities/buying-invoice-file.entity';
import { BuyingInvoiceMetaDataEntity } from './entities/buying-invoice-meta-data.entity';


@Module({
  controllers: [],
  providers: [
    BuyingInvoiceRepository,
    BuyingArticleInvoiceEntryRepository,
    BuyingArticleInvoiceEntryTaxRepository,
    BuyingInvoiceMetaDataRepository,
    BuyingInvoiceUploadRepository,

  ],
  exports: [
    BuyingInvoiceRepository,
    BuyingArticleInvoiceEntryRepository,
    BuyingArticleInvoiceEntryTaxRepository,
    BuyingInvoiceMetaDataRepository,
    BuyingInvoiceUploadRepository

  ],
  imports: [
    TypeOrmModule.forFeature([
      BuyingInvoiceEntity,
      BuyingArticleInvoiceEntryEntity,
      BuyingArticleInvoiceEntryTaxEntity,
      BuyingInvoiceMetaDataEntity,
      BuyingInvoiceUploadEntity
    ]),
  ],
})
export class BuyingInvoiceRepositoryModule {}
