import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellingQuotationEntity } from './entities/selling-quotation.entity';
import { SellingQuotationRepository } from './repository/selling-quotation.repository';
import { SellingArticleQuotationEntryRepository } from './repository/selling-article-quotation-entry.repository';
import { SellingArticleQuotationEntryTaxRepository } from './repository/selling-article-quotation-entry-tax.repository';
import { SellingQuotationMetaDataRepository } from './repository/selling-quotation-meta-data-repository';
import { SellingQuotationUploadRepository } from './repository/selling-quotation-upload.repository';
import { SellingArticleQuotationEntryTaxEntity } from './entities/selling-article-quotation-entry-tax.entity';
import { SellingArticleQuotationEntryEntity } from './entities/selling-article-quotation-entry.entity';
import { SellingQuotationUploadEntity } from './entities/selling-quotation-file.entity';
import { SellingQuotationMetaDataEntity } from './entities/selling-quotation-meta-data.entity';

@Module({
  controllers: [],
  providers: [
    SellingQuotationRepository,
    SellingArticleQuotationEntryRepository,
    SellingArticleQuotationEntryTaxRepository,
    SellingQuotationMetaDataRepository,
    SellingQuotationUploadRepository
  ],
  exports: [
    SellingQuotationRepository,
    SellingArticleQuotationEntryRepository,
    SellingArticleQuotationEntryTaxRepository,
    SellingQuotationMetaDataRepository,
    SellingQuotationUploadRepository
  ],
  imports: [
    TypeOrmModule.forFeature([
      SellingQuotationEntity,
      SellingArticleQuotationEntryEntity,
      SellingArticleQuotationEntryTaxEntity,
      SellingQuotationMetaDataEntity,
      SellingQuotationUploadEntity
    ]),
  ],
})
export class SellingQuotationRepositoryModule {}
