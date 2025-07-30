import { forwardRef, Inject, Injectable, StreamableFile } from '@nestjs/common';
import { QuotationNotFoundException } from '../../errors/quotation.notfound.error';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { InterlocutorService } from 'src/modules/interlocutor/services/interlocutor.service';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format, isAfter } from 'date-fns';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { BankAccountService } from 'src/modules/bank-account/services/bank-account.service';

import { QuotationSequence } from '../interfaces/quotation-sequence.interface';
import { Transactional } from '@nestjs-cls/transactional';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SellingQuotationEntity } from '../repositories/entities/selling-quotation.entity';
import { ResponseSellingQuotationDto } from '../dtos/selling-quotation.response.dto';
import { SellingQuotationRepository } from '../repositories/repository/selling-quotation.repository';
import {  SellingQuotationUploadService } from './selling-quotation-upload.service';
import { QuotationSequenceService } from './quotation-sequence.service';
import { CreateSellingQuotationDto } from '../dtos/selling-quotation.create.dto';
import { UpdateSellingQuotationDto } from '../dtos/selling-quotation.update.dto';
import { DuplicateSellingQuotationDto } from '../dtos/selling-quotation.duplicate.dto';
import { SellingArticleQuotationEntryService } from './selling-article-quotation-entry.service';
import { SellingQuotationMetaDataService } from './selling-quotation-meta-data.service';
import { ResponseSellingQuotationUploadDto } from '../dtos/selling-quotation-upload.response.dto';
import { SellingArticleQuotationEntryEntity } from '../repositories/entities/selling-article-quotation-entry.entity';
import { SELLING_QUOTATION_STATUS } from '../enums/selling-quotation-status.enum';
import { UpdateQuotationSequenceDto } from '../dtos/quotation-seqence.update.dto';
import { StatusStatsDto } from 'src/modules/stats/dto/status-stats.dto';
import { CabinetService } from 'src/modules/cabinet/services/cabinet.service';


@Injectable()
export class SellingQuotationService {
  constructor(
    //repositories
    private readonly sellingQuotationRepository: SellingQuotationRepository,
    //entity services
    private readonly articleQuotationEntryService: SellingArticleQuotationEntryService,
    private readonly quotationUploadService: SellingQuotationUploadService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
     @Inject(forwardRef(() => FirmService))
     private readonly firmService: FirmService,
     @Inject(forwardRef(() => InterlocutorService))
     private readonly interlocutorService: InterlocutorService,
    private readonly quotationSequenceService: QuotationSequenceService,
    private readonly quotationMetaDataService: SellingQuotationMetaDataService,
    private readonly taxService: TaxService,

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
    private readonly cabinetService:CabinetService
  ) {}

  async downloadPdf(id: number, template: string): Promise<StreamableFile> {
    const quotation = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: new String().concat(
        'firm,',
        'cabinet,',
        'currency,',
        'bankAccount,',
        'interlocutor,',
        'cabinet.address,',
        'quotationMetaData,',
        'firm.deliveryAddress,',
        'firm.invoicingAddress,',
        'articleQuotationEntries,',
        'articleQuotationEntries.article,',
        'articleQuotationEntries.articleQuotationEntryTaxes,',
        'articleQuotationEntries.articleQuotationEntryTaxes.tax',
      ),
    });
    const digitsAferComma = quotation.currency.digitAfterComma;
    const cabinet =await this.cabinetService.findOneById(1)
    if (quotation) {
      const data = {
        meta: {
          ...quotation.quotationMetaData,
            logo:cabinet.logo,
          signature:cabinet.signature,
          type: 'DEVIS',
        },
        quotation: {
          ...quotation,
          date: format(quotation.date, 'dd/MM/yyyy'),
          dueDate: format(quotation.dueDate, 'dd/MM/yyyy'),
          taxSummary: quotation.quotationMetaData.taxSummary,
          subTotal: quotation.subTotal.toFixed(digitsAferComma),
          total: quotation.total.toFixed(digitsAferComma),
        
        },
      };

      const pdfBuffer = await this.pdfService.generatePdf(data,'quotation-'+template);
      return new StreamableFile(pdfBuffer);
    } else {
      throw new QuotationNotFoundException();
    }
  }

  async findOneById(id: number): Promise<SellingQuotationEntity> {
    const quotation = await this.sellingQuotationRepository.findOneById(id);
    if (!quotation) {
      throw new QuotationNotFoundException();
    }
    return quotation;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<SellingQuotationEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const quotation = await this.sellingQuotationRepository.findOne(
      queryOptions as FindOneOptions<SellingQuotationEntity>,
    );
    if (!quotation) return null;
    return quotation;
  }

  async findAll(query: IQueryObject = {}): Promise<SellingQuotationEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.sellingQuotationRepository.findAll(
      queryOptions as FindManyOptions<SellingQuotationEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseSellingQuotationDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.sellingQuotationRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.sellingQuotationRepository.findAll(
      queryOptions as FindManyOptions<SellingQuotationEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: parseInt(query.page),
        take: parseInt(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  @Transactional()
  async save(createSellingQuotationDto: CreateSellingQuotationDto): Promise<SellingQuotationEntity> {
    // Parallelize fetching firm, bank account, and currency, as they are independent
    const [firm, bankAccount, currency] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${createSellingQuotationDto.firmId}`,
      }),
      createSellingQuotationDto.bankAccountId
        ? this.bankAccountService.findOneById(createSellingQuotationDto.bankAccountId)
        : Promise.resolve(null),
      createSellingQuotationDto.currencyId
        ? this.currencyService.findOneById(createSellingQuotationDto.currencyId)
        : Promise.resolve(null),
    ]);

    if (!firm) {
      throw new Error('Firm not found'); // Handle firm not existing
    }

    // Check interlocutor existence
    await this.interlocutorService.findOneById(
      createSellingQuotationDto.interlocutorId,
    );

    // Save article entries if provided
    const articleEntries =
      createSellingQuotationDto.articleQuotationEntries &&
      (await this.articleQuotationEntryService.saveMany(
        createSellingQuotationDto.articleQuotationEntries,
      ));

    if (!articleEntries) {
      throw new Error('Article entries are missing');
    }

    // Calculate financial information
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        createSellingQuotationDto.discount,
        createSellingQuotationDto.discount_type,
      );

    // Format articleEntries as lineItems for tax calculations
    const lineItems =
      await this.articleQuotationEntryService.findManyAsLineItem(
        articleEntries.map((entry) => entry.id),
      );

    // Calculate tax summary and fetch tax details in parallel
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);

          return {
            ...item,
            label: tax.label,
            // If the tax is a rate (percentage), multiply by 100 for percentage display,
            // otherwise use the fixed amount directly.
            value: tax.isRate ? tax.value * 100 : tax.value,
            isRate: tax.isRate, // You can also return this flag for further use.
          };
        }),
    );

    // Fetch the latest sequential number for quotation
    const sequential = await this.quotationSequenceService.getSequential();

    // Save quotation metadata
    const quotationMetaData = await this.quotationMetaDataService.save({
      ...createSellingQuotationDto.quotationMetaData,
      taxSummary,
    });

    // Save the quotation entity
    const quotation = await this.sellingQuotationRepository.save({
      ...createSellingQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      sequential,
      articleQuotationEntries: articleEntries,
      quotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
    });

    // Handle file uploads if they exist
    if (createSellingQuotationDto.uploads) {
      await Promise.all(
        createSellingQuotationDto.uploads.map((u) =>
          this.quotationUploadService.save(quotation.id, u.uploadId),
        ),
      );
    }

    return quotation;
  }

  async saveMany(
    createSellingQuotationDtos: CreateSellingQuotationDto[],
  ): Promise<SellingQuotationEntity[]> {
    const quotations = [];
    for (const createSellingQuotationDto of createSellingQuotationDtos) {
      const quotation = await this.save(createSellingQuotationDto);
      quotations.push(quotation);
    }
    return quotations;
  }

  async updateQuotationUploads(
    id: number,
    updateSellingQuotationDto: UpdateSellingQuotationDto,
    existingUploads: ResponseSellingQuotationUploadDto[],
  ) {
    const newUploads = [];
    const keptUploads = [];
    const eliminatedUploads = [];

    if (updateSellingQuotationDto.uploads) {
      for (const upload of existingUploads) {
        const exists = updateSellingQuotationDto.uploads.some(
          (u) => u.id === upload.id,
        );
        if (!exists)
          eliminatedUploads.push(
            await this.quotationUploadService.softDelete(upload.id),
          );
        else keptUploads.push(upload);
      }
      for (const upload of updateSellingQuotationDto.uploads) {
        if (!upload.id)
          newUploads.push(
            await this.quotationUploadService.save(id, upload.uploadId),
          );
      }
    }
    return {
      keptUploads,
      newUploads,
      eliminatedUploads,
    };
  }
  async patch(
    id: number,
    newData: Partial<UpdateSellingQuotationDto>
  ): Promise<SellingQuotationEntity> {
    const quotation= await this.findOneById(id)
    return this.sellingQuotationRepository.save({...quotation,...newData})
  }
  @Transactional()
  async update(
    id: number,
    updateSellingQuotationDto: UpdateSellingQuotationDto,
  ): Promise<SellingQuotationEntity> {
    // Retrieve the existing quotation with necessary relations
    const { uploads: existingUploads, ...existingQuotation } =
      await this.findOneByCondition({
        filter: `id||$eq||${id}`,
        join: 'articleQuotationEntries,quotationMetaData,uploads',
      });

    // Fetch and validate related entities in parallel to optimize performance
    const [firm, bankAccount, currency, interlocutor] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateSellingQuotationDto.firmId}`,
      }),
      updateSellingQuotationDto.bankAccountId
        ? this.bankAccountService.findOneById(updateSellingQuotationDto.bankAccountId)
        : null,
      updateSellingQuotationDto.currencyId
        ? this.currencyService.findOneById(updateSellingQuotationDto.currencyId)
        : null,
      updateSellingQuotationDto.interlocutorId
        ? this.interlocutorService.findOneById(
            updateSellingQuotationDto.interlocutorId,
          )
        : null,
    ]);

    // Soft delete old article entries to prepare for new ones
    const existingArticles =
      await this.articleQuotationEntryService.softDeleteMany(
        existingQuotation.articleQuotationEntries.map((entry) => entry.id),
      );

    // Save new article entries
    const articleEntries: SellingArticleQuotationEntryEntity[] =
      updateSellingQuotationDto.articleQuotationEntries
        ? await this.articleQuotationEntryService.saveMany(
            updateSellingQuotationDto.articleQuotationEntries,
          )
        : existingArticles;

    // Calculate the subtotal and total for the new entries
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateSellingQuotationDto.discount,
        updateSellingQuotationDto.discount_type,
      );

    // Convert article entries to line items for further calculations
    const lineItems =
      await this.articleQuotationEntryService.findManyAsLineItem(
        articleEntries.map((entry) => entry.id),
      );

    // Calculate tax summary (handle both percentage and fixed taxes)
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);

          return {
            ...item,
            label: tax.label,
            // Check if the tax is rate-based or a fixed amount
            rate: tax.isRate ? tax.value * 100 : tax.value, // handle both types
            isRate: tax.isRate,
          };
        }),
    );

    // Save or update the quotation metadata with the updated tax summary
    const quotationMetaData = await this.quotationMetaDataService.save({
      ...existingQuotation.quotationMetaData,
      ...updateSellingQuotationDto.quotationMetaData,
      taxSummary,
    });

    // Handle uploads - manage existing, new, and eliminated uploads
    const { keptUploads, newUploads, eliminatedUploads } =
      await this.updateQuotationUploads(
        existingQuotation.id,
        updateSellingQuotationDto,
        existingUploads,
      );

    // Save and return the updated quotation with all updated details
    return this.sellingQuotationRepository.save({
      ...updateSellingQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      articleQuotationEntries: articleEntries,
      quotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });
  }

  async duplicate(
    duplicateSellingQuotationDto: DuplicateSellingQuotationDto,
  ): Promise<ResponseSellingQuotationDto> {
    const existingQuotation = await this.findOneByCondition({
      filter: `id||$eq||${duplicateSellingQuotationDto.id}`,
      join: new String().concat(
        'quotationMetaData,',
        'articleQuotationEntries,',
        'articleQuotationEntries.articleQuotationEntryTaxes,',
        'uploads',
      ),
    });
    const quotationMetaData = await this.quotationMetaDataService.duplicate(
      existingQuotation.quotationMetaData.id,
    );
    const sequential = await this.quotationSequenceService.getSequential();
    const{createdAt,updatedAt,deletedAt,...filtredQuotation}=existingQuotation
    const quotation = await this.sellingQuotationRepository.save({
      ...filtredQuotation,
      sequential,
      quotationMetaData,
      articleQuotationEntries: [],
      uploads: [],
      id: undefined,
      status: SELLING_QUOTATION_STATUS.Draft,
    });
    const articleQuotationEntries =
      await this.articleQuotationEntryService.duplicateMany(
        existingQuotation.articleQuotationEntries.map((entry) => entry.id),
        quotation.id,
      );

    const uploads = duplicateSellingQuotationDto.includeFiles
      ? await this.quotationUploadService.duplicateMany(
          existingQuotation.uploads.map((upload) => upload.id),
          quotation.id,
        )
      : [];

    return this.sellingQuotationRepository.save({
      ...quotation,
      articleQuotationEntries,
      uploads,
    });
  }

  async updateStatus(
    id: number,
    status: SELLING_QUOTATION_STATUS,
  ): Promise<SellingQuotationEntity> {
    const quotation = await this.sellingQuotationRepository.findOneById(id);
    return this.sellingQuotationRepository.save({
      id: quotation.id,
      status,
    });
  }

  async updateMany(
    updateSellingQuotationDtos: UpdateSellingQuotationDto[],
  ): Promise<SellingQuotationEntity[]> {
    return this.sellingQuotationRepository.updateMany(updateSellingQuotationDtos);
  }

  async updateQuotationSequence(
    updatedSequenceDto: UpdateQuotationSequenceDto,
  ): Promise<QuotationSequence> {
    return (await this.quotationSequenceService.set(updatedSequenceDto)).value;
  }

  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredQuotations() {
    const currentDate = new Date();
    const expiredQuotations: SellingQuotationEntity[] =
      await this.sellingQuotationRepository.findAll({
        where: {
          status: SELLING_QUOTATION_STATUS.Sent,
        },
      });
    const quotationsToExpire = expiredQuotations.filter((quotation) =>
      isAfter(currentDate, new Date(quotation.dueDate)),
    );

    if (quotationsToExpire.length) {
      for (const quotation of quotationsToExpire) {
        quotation.status = SELLING_QUOTATION_STATUS.Expired;
        await this.sellingQuotationRepository.save(quotation);
      }
    }
  }

  async softDelete(id: number): Promise<SellingQuotationEntity> {
    await this.findOneById(id);
    return this.sellingQuotationRepository.softDelete(id);
  }

  async deleteAll() {
    return this.sellingQuotationRepository.deleteAll();
  }

  async getTotal(options?:any): Promise<number> {
    return this.sellingQuotationRepository.getTotalCount(options);
  }


  async getRecentQuotations(limit:number,firmId?:number,): Promise<SellingQuotationEntity[]> {
    const query = (await this.sellingQuotationRepository
      .createQueryBuilder('quotation'))
      .innerJoinAndSelect('quotation.firm', 'firm')
      .innerJoinAndSelect('quotation.currency', 'currency')
      .orderBy('quotation.date', 'DESC')
      .take(limit)
      .where('quotation.deletedAt IS NULL');

      if(firmId){
        query.andWhere({firmId:firmId})
      }
    return query.getMany();
  }

  async getQuotationStatus(dateFilter?: any,firmId?:number): Promise<StatusStatsDto[]> {
    const query = (await this.sellingQuotationRepository
      .createQueryBuilder('quotation'))
      .select('quotation.status', 'status')
      .addSelect('COUNT(quotation.id)', 'count')
      .groupBy('quotation.status')
      .where('quotation.deletedAt IS NULL');
  
    if (dateFilter) {
      query.andWhere({ date: dateFilter });
    }
    if (firmId) {
      query.andWhere({ firmId:firmId });
    }
  
    return query.getRawMany();
  }
  
  async getConversionRate(dateFilter?: any,firmId?:number): Promise<number> {
    const totalQuotations = await this.sellingQuotationRepository.getTotalCount({
      where: {
        date: dateFilter,
        deletedAt: null,
        firmId:firmId
      },
    });
    const invoicedQuotations = await this.sellingQuotationRepository.getTotalCount({
      where: {
        status: SELLING_QUOTATION_STATUS.Invoiced,
        date: dateFilter,
        deletedAt: null,
        firmId:firmId

      },
    });

    return totalQuotations!==0?(invoicedQuotations / totalQuotations) * 100 : null ;
  }
  async getAcceptanceRate(dateFilter?: any,firmId?:number): Promise<number> {
    const totalQuotations = await this.sellingQuotationRepository.getTotalCount({
      where: {
        status: In([SELLING_QUOTATION_STATUS.Sent,SELLING_QUOTATION_STATUS.Accepted,SELLING_QUOTATION_STATUS.Rejected,SELLING_QUOTATION_STATUS.Invoiced]),
        date: dateFilter,
        deletedAt: null,
        firmId:firmId
      },
    });
    const acceptedQuotations = await this.sellingQuotationRepository.getTotalCount({
      where: {
        status: In([SELLING_QUOTATION_STATUS.Accepted,SELLING_QUOTATION_STATUS.Invoiced]),
        date: dateFilter,
        deletedAt: null,
        firmId:firmId
      },
    });
   
    return totalQuotations!==0?(acceptedQuotations / totalQuotations) * 100 :null;
  }
  async getRejectionRate(dateFilter?: any,firmId?:number): Promise<number> {
    const totalQuotations = await this.sellingQuotationRepository.getTotalCount({
      where: {
        status: In([SELLING_QUOTATION_STATUS.Sent,SELLING_QUOTATION_STATUS.Accepted,SELLING_QUOTATION_STATUS.Rejected,SELLING_QUOTATION_STATUS.Invoiced]),
        date: dateFilter,
        deletedAt: null,
        firmId:firmId
      },
    });
    const rejectedQuotations = await this.sellingQuotationRepository.getTotalCount({
      where: {
        status: SELLING_QUOTATION_STATUS.Rejected,
        date: dateFilter,
        deletedAt: null,
        firmId:firmId
      },
    });

    return totalQuotations!==0?(rejectedQuotations / totalQuotations) * 100:null;
  }


  public async getCountsByDate(
    dateFilter?: any,
    firmId?:number
  ): Promise<Array<{ date: string; count: number }>> {
    const queryBuilder = (await this.sellingQuotationRepository
      .createQueryBuilder('quotation'))
      .select('DATE(quotation.date)', 'date')
      .addSelect('COUNT(quotation.id)', 'count')
      .groupBy('DATE(quotation.date)')
      .orderBy('DATE(quotation.date)', 'ASC')
      if (dateFilter) {
        queryBuilder.andWhere({ date: dateFilter });
      } 
      if (firmId) {
        queryBuilder.andWhere({ firmId:firmId });
      }  
    const results = await queryBuilder.getRawMany();
    
    return results.map(item => ({
      date: item.date,
      count: parseInt(item.count)
    }));
  }
    async findOneBySequential(sequential: string): Promise<SellingQuotationEntity> {
      const sellingquotation = await this.sellingQuotationRepository.findOneBySequential(sequential);
      if (!sellingquotation) {
        throw new QuotationNotFoundException();
      }
      return sellingquotation;
    }
}
