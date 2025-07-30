import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellingInvoiceRepository } from './repository/selling-invoice.repository';
import { SellingInvoiceEntity } from './entities/selling-invoice.entity';
import { SellingInvoiceModule } from '../selling-invoice.module';
import { SellingArticleInvoiceEntryRepository } from './repository/selling-article-invoice-entry.repository';
import { SellingArticleInvoiceEntryTaxRepository } from './repository/selling-article-invoice-entry-tax.repository';
import { SellingInvoiceMetaDataRepository } from './repository/selling-invoice-meta-data.repository';
import { SellingInvoiceUploadRepository } from './repository/selling-invoice-upload.repository';
import { SellingArticleInvoiceEntryTaxEntity } from './entities/selling-article-invoice-entry-tax.entity';
import { SellingArticleInvoiceEntryEntity } from './entities/selling-article-invoice-entry.entity';
import { SellingInvoiceUploadEntity } from './entities/selling-invoice-file.entity';
import { SellingInvoiceMetaDataEntity } from './entities/selling-invoice-meta-data.entity';


@Module({
  controllers: [],
  providers: [
    SellingInvoiceRepository,
    SellingArticleInvoiceEntryRepository,
    SellingArticleInvoiceEntryTaxRepository,
    SellingInvoiceMetaDataRepository,
    SellingInvoiceUploadRepository

  ],
  exports: [
    SellingInvoiceRepository,
    SellingArticleInvoiceEntryRepository,
    SellingArticleInvoiceEntryTaxRepository,
    SellingInvoiceMetaDataRepository,
    SellingInvoiceUploadRepository

  ],
  imports: [
    TypeOrmModule.forFeature([
      SellingInvoiceEntity,
      SellingArticleInvoiceEntryEntity,
      SellingArticleInvoiceEntryTaxEntity,
      SellingInvoiceMetaDataEntity,
      SellingInvoiceUploadEntity
    ]),
  ],
})
export class SellingInvoiceRepositoryModule {}
