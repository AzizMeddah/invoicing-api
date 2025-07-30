import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { BuyingArticleInvoiceEntryTaxRepository } from '../repositories/repository/buying-article-invoice-entry-tax.repository';
import { BuyingArticleInvoiceEntryTaxEntity } from '../repositories/entities/buying-article-invoice-entry-tax.entity';
import { CreateBuyingArticleInvoiceEntryTaxDto } from '../dtos/buying-article-invoice-entry-tax.create.dto';


@Injectable()
export class BuyingArticleInvoiceEntryTaxService {
  constructor(
    private readonly articleInvoiceEntryTaxRepository: BuyingArticleInvoiceEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleInvoiceEntryTaxDto: CreateBuyingArticleInvoiceEntryTaxDto,
  ): Promise<BuyingArticleInvoiceEntryTaxEntity> {
    const tax = await this.taxService.findOneById(
      createArticleInvoiceEntryTaxDto.taxId,
    );
    const taxEntry = await this.articleInvoiceEntryTaxRepository.save({
      articleInvoiceEntryId:
        createArticleInvoiceEntryTaxDto.articleInvoiceEntryId,
      tax,
    });
    return taxEntry;
  }

  async saveMany(
    createArticleInvoiceEntryTaxDtos: CreateBuyingArticleInvoiceEntryTaxDto[],
  ): Promise<BuyingArticleInvoiceEntryTaxEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleInvoiceEntryTaxDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async softDelete(id: number): Promise<void> {
    await this.articleInvoiceEntryTaxRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<void> {
    ids.forEach(async (id) => await this.softDelete(id));
  }
}
