import { forwardRef, Inject, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { QuotationNotFoundException } from '../../errors/quotation.notfound.error';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { InterlocutorService } from 'src/modules/interlocutor/services/interlocutor.service';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';

import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format, isAfter } from 'date-fns';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { BankAccountService } from 'src/modules/bank-account/services/bank-account.service';

import { QuotationSequence } from '../../selling-quotation/interfaces/quotation-sequence.interface';
import { Transactional } from '@nestjs-cls/transactional';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StorageService } from 'src/common/storage/services/storage.service';
import { CreateBuyingQuotationDto } from '../dtos/buying-quotation.create.dto';
import { BuyingQuotationEntity } from '../repositories/entities/buying-quotation.entity';
import { ResponseBuyingQuotationDto } from '../dtos/buying-quotation.response.dto';
import { UpdateBuyingQuotationDto } from '../dtos/buying-quotation.update.dto';
import { DuplicateBuyingQuotationDto } from '../dtos/buying-quotation.duplicate.dto';
import { BuyingQuotationRepository } from '../repositories/repository/buying-quotation.repository';
import { BuyingQuotationMetaDataService } from './buying-quotation-meta-data.service';
import { BuyingQuotationUploadService } from './buying-quotation-upload.service';
import { BuyingArticleQuotationEntryService } from './buying-article-quotation-entry.service';
import { BUYING_QUOTATION_STATUS } from '../enums/buying-quotation-status.enum';
import { QuotationSequenceService } from '../../selling-quotation/services/quotation-sequence.service';
import { BuyingArticleQuotationEntryEntity } from '../repositories/entities/buying-article-quotation-entry.entity';
import { BuyingQuotationUploadEntity } from '../repositories/entities/buying-quotation-file.entity';
import { ResponseBuyingQuotationUploadDto } from '../dtos/buying-quotation-upload.response.dto';
import { UpdateQuotationSequenceDto } from '../../selling-quotation/dtos/quotation-seqence.update.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { FirmBankAccountService } from 'src/modules/firm-bank-account/services/firm-bank-account.service';
import { StatusStatsDto } from 'src/modules/stats/dto/status-stats.dto';

@Injectable()
export class BuyingQuotationService{

  constructor(
    private readonly buyingQuotationRepository: BuyingQuotationRepository,
    private readonly storageService: StorageService,

    private readonly articleQuotationEntryService: BuyingArticleQuotationEntryService,
    private readonly quotationUploadService: BuyingQuotationUploadService,
    private readonly bankAccountService: FirmBankAccountService,
    private readonly currencyService: CurrencyService,
    @Inject(forwardRef(() => FirmService))
    private readonly firmService: FirmService,
    @Inject(forwardRef(() => InterlocutorService))
    private readonly interlocutorService: InterlocutorService,
    private readonly quotationMetaDataService: BuyingQuotationMetaDataService,
    private readonly taxService: TaxService,

    private readonly calculationsService: InvoicingCalculationsService,
    
    private readonly pdfService: PdfService,
    private configService: ConfigService,
    


  ) {
  }


  async findOneBySequential(sequential: string,firmId:number): Promise<BuyingQuotationEntity> {
    const quotation = await this.buyingQuotationRepository.findOneBySequential(sequential,firmId);
    if (!quotation) {
      throw new QuotationNotFoundException();
    }
    return quotation;
  }

  async findOneById(id: number): Promise<BuyingQuotationEntity> {
    const quotation = await this.buyingQuotationRepository.findOneById(id);
    if (!quotation) {
      throw new QuotationNotFoundException();
    }
    return quotation;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<BuyingQuotationEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const quotation = await this.buyingQuotationRepository.findOne(
      queryOptions as FindOneOptions<BuyingQuotationEntity>,
    );
    if (!quotation) return null;
    return quotation;
  }

  async findAll(query: IQueryObject = {}): Promise<BuyingQuotationEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.buyingQuotationRepository.findAll(
      queryOptions as FindManyOptions<BuyingQuotationEntity>,
    );
  }

  @Transactional()
  async save(
    createBuyingQuotationDto: CreateBuyingQuotationDto,
  ): Promise<BuyingQuotationEntity> {
    // Utilisez le DTO correct dans toutes les références
    const [firm, bankAccount, currency] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${createBuyingQuotationDto.firmId}`,
      }),
      createBuyingQuotationDto.bankAccountId
        ? this.bankAccountService.findOneById(createBuyingQuotationDto.bankAccountId)
        : Promise.resolve(null),
      createBuyingQuotationDto.currencyId
        ? this.currencyService.findOneById(createBuyingQuotationDto.currencyId)
        : Promise.resolve(null),
    ]);

    if (!firm) {
      throw new Error('Firm not found');
    }

    // Vérifier l'existence de l'interlocuteur
    await this.interlocutorService.findOneById(
      createBuyingQuotationDto.interlocutorId,
    );

    // Sauvegarder les entrées d'articles si fournies
    const articleEntries =
      createBuyingQuotationDto.articleQuotationEntries &&
      (await this.articleQuotationEntryService.saveMany(
        createBuyingQuotationDto.articleQuotationEntries,
      ));

    if (!articleEntries) {
      throw new Error('Article entries are missing');
    }
    

    // Calcul des informations financières
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Appliquer la remise générale
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        createBuyingQuotationDto.discount,
        createBuyingQuotationDto.discount_type,
      );

    // Formatage des entrées d'articles pour les calculs de taxe
    const lineItems =
      await this.articleQuotationEntryService.findManyAsLineItem(
        articleEntries.map((entry) => entry.id),
      );

    // Calculer le résumé des taxes et récupérer les détails des taxes en parallèle
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);
          return {
            ...item,
            label: tax.label,
            value: tax.isRate ? tax.value * 100 : tax.value,
            isRate: tax.isRate,
          };
        }),
    );


    // verifie l existance du sequentiel
    const existingSequential=await this.buyingQuotationRepository.findOneBySequential(createBuyingQuotationDto.sequential,createBuyingQuotationDto.firmId);

    if (existingSequential) {
      throw new Error('quotation.errors.seq_already_exist');
    }
    // Sauvegarder les métadonnées du devis
    const quotationMetaData = await this.quotationMetaDataService.save({
      ...createBuyingQuotationDto.quotationMetaData,
      taxSummary,
    });


  
    // Récupérer le document de référence
    const referenceDoc = await this.storageService.findOneById(
      createBuyingQuotationDto.referenceDocId,
    );  
    if (!referenceDoc) {
      throw new NotFoundException('Reference document not found');
    }

    // Sauvegarder l'entité BuyingQuotation
    const BuyingQuotation = await this.buyingQuotationRepository.save({
      ...createBuyingQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      articleQuotationEntries: articleEntries,
      quotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
      referenceDoc,
    });

    // Gérer les uploads de fichiers si présents
    if (createBuyingQuotationDto.uploads) {
      await Promise.all(
        createBuyingQuotationDto.uploads.map((u) =>
          this.quotationUploadService.save(BuyingQuotation.id, u.uploadId),
        ),
      );
    }
    return BuyingQuotation;
  }

  async saveMany(
    createBuyingQuotationDtos: CreateBuyingQuotationDto[],
  ): Promise<BuyingQuotationEntity[]> {
    const quotations = [];
    for (const createBuyingQuotationDto of createBuyingQuotationDtos) {
      const quotation = await this.save(createBuyingQuotationDto);
      quotations.push(quotation);
    }
    return quotations;
  }


  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredQuotations() {
    const currentDate = new Date();
    const expiredQuotations: BuyingQuotationEntity[] =
      await this.buyingQuotationRepository.findAll({
        where: {
          status: BUYING_QUOTATION_STATUS.Validated,
        },
      });
    const quotationsToExpire = expiredQuotations.filter((quotation) =>
      isAfter(currentDate, new Date(quotation.dueDate)),
    );

    if (quotationsToExpire.length) {
      for (const quotation of quotationsToExpire) {
        quotation.status = BUYING_QUOTATION_STATUS.Expired;
        await this.buyingQuotationRepository.save(quotation);
      }
    }
  }

  async patch(
    id: number,
    newData: Partial<UpdateBuyingQuotationDto>
  ): Promise<BuyingQuotationEntity> {
    const quotation= await this.findOneById(id)
    return this.buyingQuotationRepository.save({...quotation,...newData})
  }

  @Transactional()
  async update(
    id: number,
    updateBuyingQuotationDto: UpdateBuyingQuotationDto,
  ): Promise<BuyingQuotationEntity> {
    // Retrieve the existing quotation with necessary relations
    const {referenceDoc:referenceDoc, uploads: existingUploads, ...existingQuotation } =
      await this.findOneByCondition({
        filter: `id||$eq||${id}`,
        join: 'articleQuotationEntries,quotationMetaData,uploads,referenceDoc',
      });

    // Fetch and validate related entities in parallel to optimize performance
    const [firm, bankAccount, currency, interlocutor] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateBuyingQuotationDto.firmId}`,
      }),
      updateBuyingQuotationDto.bankAccountId
        ? this.bankAccountService.findOneById(updateBuyingQuotationDto.bankAccountId)
        : null,
      updateBuyingQuotationDto.currencyId
        ? this.currencyService.findOneById(updateBuyingQuotationDto.currencyId)
        : null,
      updateBuyingQuotationDto.interlocutorId
        ? this.interlocutorService.findOneById(
            updateBuyingQuotationDto.interlocutorId,
          )
        : null,
    ]);

    // Soft delete old article entries to prepare for new ones
    const existingArticles =
      await this.articleQuotationEntryService.softDeleteMany(
        existingQuotation.articleQuotationEntries.map((entry) => entry.id),
      );

    // Save new article entries
    const articleEntries: BuyingArticleQuotationEntryEntity[] =
      updateBuyingQuotationDto.articleQuotationEntries
        ? await this.articleQuotationEntryService.saveMany(
            updateBuyingQuotationDto.articleQuotationEntries,
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
        updateBuyingQuotationDto.discount,
        updateBuyingQuotationDto.discount_type,
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
      ...updateBuyingQuotationDto.quotationMetaData,
      taxSummary,
    });

    // Handle uploads - manage existing, new, and eliminated uploads
    const { keptUploads, newUploads, eliminatedUploads } =
      await this.updateBuyingQuotationUploads(
        existingQuotation.id,
        updateBuyingQuotationDto,
        existingUploads,
      );

    // handle refernce document update
    const exist=existingQuotation.referenceDocId==updateBuyingQuotationDto.referenceDocId;
    let savedReferenceDoc:UploadEntity=null;
    if(!exist){
      await this.storageService.delete(existingQuotation.referenceDocId);
      savedReferenceDoc = await this.storageService.findOneById(updateBuyingQuotationDto.referenceDocId);
    }

    // Save and return the updated quotation with all updated details
    return this.buyingQuotationRepository.save({
      ...updateBuyingQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      articleQuotationEntries: articleEntries,
      quotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
      referenceDocId: savedReferenceDoc?savedReferenceDoc.id:referenceDoc.id,
    });
  }

  async updateBuyingQuotationUploads(
    id: number,
    updateBuyingQuotationDto: UpdateBuyingQuotationDto,
    existingUploads: ResponseBuyingQuotationUploadDto[],
  ) {
    const newUploads = [];
    const keptUploads = [];
    const eliminatedUploads = [];

    if (updateBuyingQuotationDto.uploads) {
      for (const upload of existingUploads) {
        const exists = updateBuyingQuotationDto.uploads.some(
          (u) => u.id === upload.id,
        );
        if (!exists)
          eliminatedUploads.push(
            await this.quotationUploadService.softDelete(upload.id),
          );
        else keptUploads.push(upload);
      }
      for (const upload of updateBuyingQuotationDto.uploads) {
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

  async duplicate(
    duplicateBuyingQuotationDto: DuplicateBuyingQuotationDto,
  ): Promise<ResponseBuyingQuotationDto> {


    const existingQuotation = await this.findOneByCondition({
      filter: `id||$eq||${duplicateBuyingQuotationDto.id}`,
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
    const{createdAt,updatedAt,deletedAt,...filtredQuotation}=existingQuotation


    const quotation = await this.buyingQuotationRepository.save({
      ...filtredQuotation,
      quotationMetaData,
      articleQuotationEntries: [],
      uploads: [],
      referenceDoc: null,
      sequential:null,
      id: undefined,
      status: BUYING_QUOTATION_STATUS.Draft,
    });
    const articleQuotationEntries =
      await this.articleQuotationEntryService.duplicateMany(
        existingQuotation.articleQuotationEntries.map((entry) => entry.id),
        quotation.id,
      );

    const uploads = duplicateBuyingQuotationDto.includeFiles
      ? await this.quotationUploadService.duplicateMany(
        existingQuotation.uploads.map((upload) => upload.id),
          quotation.id,
        )
      : [];

    const referenceDoc = await this.storageService.duplicate(existingQuotation.referenceDocId);
    
    return this.buyingQuotationRepository.save({
      ...quotation,
      articleQuotationEntries,
      uploads,
      referenceDoc,
      referenceDocId:referenceDoc.id
    });
  }


  async updateStatus(
    id: number,
    status: BUYING_QUOTATION_STATUS,
  ): Promise<BuyingQuotationEntity> {
    const quotation = await this.buyingQuotationRepository.findOneById(id);
    return this.buyingQuotationRepository.save({
      id: quotation.id,
      status,
    });
  }

  async updateMany(
    updateBuyingQuotationDtos: UpdateBuyingQuotationDto[],
  ): Promise<BuyingQuotationEntity[]> {
    return this.buyingQuotationRepository.updateMany(updateBuyingQuotationDtos);
  }


  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseBuyingQuotationDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.buyingQuotationRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.buyingQuotationRepository.findAll(
      queryOptions as FindManyOptions<BuyingQuotationEntity>,
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
    
  async downloadReferenceDocPdf(id: number, res: Response) {
    const quotation = await this.findOneById(id);
    if (!quotation) {
      throw new QuotationNotFoundException();
    }
    const referenceDoc = await this.storageService.findOneById(quotation.referenceDocId);
    const rootLocation = this.configService.get('app.uploadPath', { infer: '/upload' });

    const filePath = join(rootLocation,referenceDoc.relativePath);
    const filename = referenceDoc.filename;


    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement:', err);
      }
    });
  }

  async softDelete(id: number): Promise<BuyingQuotationEntity> {
    await this.findOneById(id);
    return this.buyingQuotationRepository.softDelete(id);
  }

  async deleteAll() {
    return this.buyingQuotationRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.buyingQuotationRepository.getTotalCount();
  }

  async getRecentQuotations(limit:number,firmId?:number): Promise<BuyingQuotationEntity[]> {
    const query = (await this.buyingQuotationRepository
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
    const query = (await this.buyingQuotationRepository
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


  
  public async getCountsByDate(
    dateFilter?: any,
    firmId?:number
  ): Promise<Array<{ date: string; count: number }>> {
    const queryBuilder = (await this.buyingQuotationRepository
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
    async getConversionRate(dateFilter?: any,firmId?:number): Promise<number> {
      const totalQuotations = await this.buyingQuotationRepository.getTotalCount({
        where: {
          date: dateFilter,
          deletedAt: null,
          firmId:firmId
        },
      });
      const invoicedQuotations = await this.buyingQuotationRepository.getTotalCount({
        where: {
          status: BUYING_QUOTATION_STATUS.Invoiced,
          date: dateFilter,
          deletedAt: null,
          firmId:firmId
        },
      });
  
      return totalQuotations!==0?(invoicedQuotations / totalQuotations) * 100 : null ;
    }
    
}


