import { Injectable } from "@nestjs/common";
import { BuyingArticleQuotationEntryTaxRepository } from "../repositories/repository/buying-article-quotation-entry-tax.repository";
import { TaxService } from "src/modules/tax/services/tax.service";
import { BuyingArticleQuotationEntryTaxEntity } from "../repositories/entities/buying-article-quotation-entry-tax.entity";
import { CreateBuyingArticleQuotationEntryTaxDto } from "../dtos/buying-article-quotation-entry-tax.create.dto";

@Injectable()
export class BuyingArticleQuotationEntryTaxService {
  constructor(
    private readonly articleQuotationEntryTaxRepository: BuyingArticleQuotationEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleQuotationEntryTaxDto: CreateBuyingArticleQuotationEntryTaxDto,
  ): Promise<BuyingArticleQuotationEntryTaxEntity> {
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
    createArticleQuotationEntryTaxDtos: CreateBuyingArticleQuotationEntryTaxDto[],
  ): Promise<BuyingArticleQuotationEntryTaxEntity[]> {
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
