import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { SellingArticleInvoiceEntryTaxRepository } from '../repositories/repository/selling-article-invoice-entry-tax.repository';
import { SellingArticleInvoiceEntryTaxEntity } from '../repositories/entities/selling-article-invoice-entry-tax.entity';
import { CreateSellingArticleInvoiceEntryTaxDto } from '../dtos/selling-article-invoice-entry-tax.create.dto';


@Injectable()
export class SellingArticleInvoiceEntryTaxService {
  constructor(
    private readonly articleInvoiceEntryTaxRepository: SellingArticleInvoiceEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleInvoiceEntryTaxDto: CreateSellingArticleInvoiceEntryTaxDto,
  ): Promise<SellingArticleInvoiceEntryTaxEntity> {
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
    createArticleInvoiceEntryTaxDtos: CreateSellingArticleInvoiceEntryTaxDto[],
  ): Promise<SellingArticleInvoiceEntryTaxEntity[]> {
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
