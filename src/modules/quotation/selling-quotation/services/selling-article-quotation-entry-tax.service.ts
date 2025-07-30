import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { SellingArticleQuotationEntryTaxRepository } from '../repositories/repository/selling-article-quotation-entry-tax.repository';
import { SellingArticleQuotationEntryTaxEntity } from '../repositories/entities/selling-article-quotation-entry-tax.entity';
import { CreateSellingArticleQuotationEntryTaxDto } from '../dtos/selling-article-quotation-entry-tax.create.dto';
@Injectable()
export class SellingArticleQuotationEntryTaxService {
  constructor(
    private readonly articleQuotationEntryTaxRepository: SellingArticleQuotationEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleQuotationEntryTaxDto:  CreateSellingArticleQuotationEntryTaxDto,
  ): Promise<SellingArticleQuotationEntryTaxEntity> {
    const tax = await this.taxService.findOneById(
      createArticleQuotationEntryTaxDto.taxId,
    );
    const taxEntry = await this.articleQuotationEntryTaxRepository.save({
      articleQuotationEntryId:
        createArticleQuotationEntryTaxDto.articleQuotationEntryId,
      tax,
    });
    return taxEntry;
  }

  async saveMany(
    createArticleQuotationEntryTaxDtos: CreateSellingArticleQuotationEntryTaxDto[],
  ): Promise<SellingArticleQuotationEntryTaxEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleQuotationEntryTaxDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async softDelete(id: number): Promise<void> {
    await this.articleQuotationEntryTaxRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<void> {
    ids.forEach(async (id) => await this.softDelete(id));
  }
}
