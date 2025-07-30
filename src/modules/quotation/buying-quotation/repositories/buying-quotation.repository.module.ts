import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyingQuotationEntity} from './entities/buying-quotation.entity';
import { BuyingQuotationRepository } from './repository/buying-quotation.repository';
import { BuyingArticleQuotationEntryTaxRepository } from './repository/buying-article-quotation-entry-tax.repository';
import { BuyingArticleQuotationEntryRepository } from './repository/buying-article-quotation-entry.repository';
import { BuyingQuotationMetaDataRepository } from './repository/buying-quotation-meta-data-repository';
import { BuyingQuotationUploadRepository } from './repository/buying-quotation-upload.repository';
import { BuyingArticleQuotationEntryTaxEntity } from './entities/buying-article-quotation-entry-tax.entity';
import { BuyingArticleQuotationEntryEntity } from './entities/buying-article-quotation-entry.entity';
import { BuyingQuotationMetaDataEntity } from './entities/buying-quotation-meta-data.entity';
import { BuyingQuotationUploadEntity } from './entities/buying-quotation-file.entity';

@Module({
  providers: [
    BuyingQuotationRepository,
    BuyingArticleQuotationEntryTaxRepository,
    BuyingArticleQuotationEntryRepository,
    BuyingQuotationMetaDataRepository,
    BuyingQuotationUploadRepository
  ],
  exports: [
    BuyingQuotationRepository,
    BuyingQuotationRepository,
    BuyingArticleQuotationEntryTaxRepository,
    BuyingArticleQuotationEntryRepository,
    BuyingQuotationMetaDataRepository,
    BuyingQuotationUploadRepository
  ],
  imports: [
    TypeOrmModule.forFeature([
      BuyingQuotationEntity,    
      BuyingArticleQuotationEntryTaxEntity,
      BuyingArticleQuotationEntryEntity,
      BuyingQuotationMetaDataEntity,
      BuyingQuotationUploadEntity]),
  ],
})
export class BuyingQuotationRepositoryModule {}
