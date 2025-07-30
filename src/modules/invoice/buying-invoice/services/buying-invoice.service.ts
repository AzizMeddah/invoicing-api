import { forwardRef, Inject, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { InterlocutorService } from 'src/modules/interlocutor/services/interlocutor.service';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions, In, IsNull, Not, UpdateResult } from 'typeorm';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format, isAfter } from 'date-fns';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { BankAccountService } from 'src/modules/bank-account/services/bank-account.service';
import { Transactional } from '@nestjs-cls/transactional';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TaxWithholdingService } from 'src/modules/tax-withholding/services/tax-withholding.service';
import { ciel } from 'src/utils/number.utils';
import { parseSequential } from 'src/utils/sequence.utils';
import { BuyingInvoiceRepository } from '../repositories/repository/buying-invoice.repository';
import { InvoiceNotFoundException } from '../../errors/invoice.notfound.error';
import { BuyingInvoiceEntity } from '../repositories/entities/buying-invoice.entity';
import { ResponseBuyingInvoiceDto } from '../dtos/buying-invoice.response.dto';
import { ResponseBuyingInvoiceRangeDto } from '../dtos/buying-invoice-range.response.dto';
import { CreateBuyingInvoiceDto } from '../dtos/buying-invoice.create.dto';
import { BuyingQuotationEntity } from 'src/modules/quotation/buying-quotation/repositories/entities/buying-quotation.entity';
import { UpdateBuyingInvoiceDto } from '../dtos/buying-invoice.update.dto';
import { InvoiceSequence } from '../../selling-invoice/interfaces/invoice-sequence.interface';
import { DuplicateBuyingInvoiceDto } from '../dtos/buying-invoice.duplicate.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { BuyingArticleInvoiceEntryService } from './buying-article-invoice-entry.service';
import { BuyingInvoiceUploadService } from './buying-invoice-upload.service';
import { BuyingInvoiceMetaDataService } from './buying-invoice-meta-data.service';
import { InvoiceSequenceService } from '../../selling-invoice/services/invoice-sequence.service';
import { UpdateInvoiceSequenceDto } from '../../selling-invoice/dtos/invoice-seqence.update.dto';
import { BuyingArticleInvoiceEntryEntity } from '../repositories/entities/buying-article-invoice-entry.entity';
import { BuyingInvoiceUploadEntity } from '../repositories/entities/buying-invoice-file.entity';
import { ResponseBuyingInvoiceUploadDto } from '../dtos/buying-invoice-upload.response.dto';
import { BUYING_INVOICE_STATUS } from '../enums/buying-invoice-status.enum';
import { join } from 'path';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { FirmBankAccountService } from 'src/modules/firm-bank-account/services/firm-bank-account.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatusStatsDto } from 'src/modules/stats/dto/status-stats.dto';
import { BuyingPaymentInvoiceEntryRepository } from 'src/modules/payment/buying-payment/repositories/repository/buying-payment-invoice-entry.repository';


@Injectable()
export class BuyingInvoiceService {
  constructor(
    //repositories
    private readonly buyingInvoiceRepository: BuyingInvoiceRepository,
    private readonly buyingPaymentInvoiceEntryRepository: BuyingPaymentInvoiceEntryRepository,

    //entity services
    private readonly articleInvoiceEntryService: BuyingArticleInvoiceEntryService,
    private readonly invoiceUploadService: BuyingInvoiceUploadService,
    private readonly bankAccountService: FirmBankAccountService,
    private readonly currencyService: CurrencyService,
    
    @Inject(forwardRef(() => FirmService))
    private readonly firmService: FirmService,
    @Inject(forwardRef(() => InterlocutorService))
    private readonly interlocutorService: InterlocutorService,
    private readonly invoiceMetaDataService: BuyingInvoiceMetaDataService,
    private readonly taxService: TaxService,
    private readonly taxWithholdingService: TaxWithholdingService,

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
    private configService: ConfigService,

    private readonly storageService: StorageService
  ) {}

    async downloadReferenceDocPdf(id: number, res: Response) {
      const invoice = await this.findOneById(id);
      if (!invoice) {
        throw new InvoiceNotFoundException();
      }
      const referenceDoc = await this.storageService.findOneById(invoice.referenceDocId);
      const rootLocation = this.configService.get('app.uploadPath', { infer: '/upload' });
    
      const filePath = join(rootLocation,referenceDoc.relativePath);
      const filename = referenceDoc.filename;
    
    
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Erreur lors du téléchargement:', err);
        }
      });
    }
    

  async findOneById(id: number): Promise<BuyingInvoiceEntity> {
    const invoice = await this.buyingInvoiceRepository.findOneById(id);
    if (!invoice) {
      throw new InvoiceNotFoundException();
    }
    return invoice;
  }

  async findOneByCondition(
    query: IQueryObject = {},
  ): Promise<BuyingInvoiceEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const invoice = await this.buyingInvoiceRepository.findByCondition(
      queryOptions as FindOneOptions<BuyingInvoiceEntity>,
    );
    if (!invoice) return null;
    return invoice;
  }

  async findAll(query: IQueryObject = {}): Promise<BuyingInvoiceEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.buyingInvoiceRepository.findAll(
      queryOptions as FindManyOptions<BuyingInvoiceEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseBuyingInvoiceDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.buyingInvoiceRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.buyingInvoiceRepository.findAll(
      queryOptions as FindManyOptions<BuyingInvoiceEntity>,
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
  async find(options: FindManyOptions<BuyingInvoiceEntity>): Promise<BuyingInvoiceEntity[]> {
    return this.buyingInvoiceRepository.find(options);
  }
  @Transactional()
  async save(createBuyingInvoiceDto: CreateBuyingInvoiceDto): Promise<BuyingInvoiceEntity> {
    // Parallelize fetching firm, bank account, and currency, as they are independent
    const [firm, bankAccount, currency] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${createBuyingInvoiceDto.firmId}`,
      }),
      createBuyingInvoiceDto.bankAccountId
        ? this.bankAccountService.findOneById(createBuyingInvoiceDto.bankAccountId)
        : Promise.resolve(null),
      createBuyingInvoiceDto.currencyId
        ? this.currencyService.findOneById(createBuyingInvoiceDto.currencyId)
        : Promise.resolve(null),
    ]);

    if (!firm) {
      throw new Error('Firm not found');
    }

    // Check interlocutor existence
    await this.interlocutorService.findOneById(createBuyingInvoiceDto.interlocutorId);

    // Save article entries if provided
    const articleEntries =
      createBuyingInvoiceDto.articleInvoiceEntries &&
      (await this.articleInvoiceEntryService.saveMany(
        createBuyingInvoiceDto.articleInvoiceEntries,
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

    // Fetch tax stamp if provided
    const taxStamp = createBuyingInvoiceDto.taxStampId
      ? await this.taxService.findOneById(createBuyingInvoiceDto.taxStampId)
      : null;

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        createBuyingInvoiceDto.discount,
        createBuyingInvoiceDto.discount_type,
        taxStamp?.value || 0,
      );

    // Format articleEntries as lineItems for tax calculations
    const lineItems = await this.articleInvoiceEntryService.findManyAsLineItem(
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

    // verifie l existance du sequentiel
    if(createBuyingInvoiceDto.sequential){
      const existingSequential=await this.buyingInvoiceRepository.findOneBySequential(createBuyingInvoiceDto.sequential,createBuyingInvoiceDto.firmId);
      if (existingSequential) {
        throw new Error('invoice.errors.seq_already_exist');
      }
    }
    // Save invoice metadata
    const invoiceMetaData = await this.invoiceMetaDataService.save({
      ...createBuyingInvoiceDto.invoiceMetaData,
      taxSummary,
    });

    // Ensure taxWithholding.rate is valid and calculate the withholding amount
    let taxWithholdingAmount = 0;
    if (createBuyingInvoiceDto.taxWithholdingId) {
      const taxWithholding = await this.taxWithholdingService.findOneById(
        createBuyingInvoiceDto.taxWithholdingId,
      );

      if (taxWithholding.rate !== undefined && taxWithholding.rate !== null) {
        taxWithholdingAmount =
          totalAfterGeneralDiscount * (taxWithholding.rate / 100);
      }
    }
    let referenceDoc
    if(!createBuyingInvoiceDto.referenceDocId){
     referenceDoc = await this.storageService.findOneById(
      createBuyingInvoiceDto.referenceDocId
    );
    if (!referenceDoc) {
      throw new NotFoundException('Reference document not found');
    }
  }

    // Save the invoice entity
    const invoice = await this.buyingInvoiceRepository.save({
      ...createBuyingInvoiceDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      //this will be changed to fit with the connected cabinet
      cabinetId: 1,
      articleInvoiceEntries: articleEntries,
      invoiceMetaData,
      subTotal,
      taxWithholdingAmount: taxWithholdingAmount || 0,
      total: totalAfterGeneralDiscount,
      referenceDoc:createBuyingInvoiceDto.referenceDocId?referenceDoc:null,

    });
    // Handle file uploads if they exist
    if (createBuyingInvoiceDto.uploads) {
      await Promise.all(
        createBuyingInvoiceDto.uploads.map((u) =>
          this.invoiceUploadService.save(invoice.id, u.uploadId),
        ),
      );
    }

    return invoice;
  }

  async findOneBySequential(sequential: string,firmId:number): Promise<BuyingInvoiceEntity> {
    const invoice = await this.buyingInvoiceRepository.findOneBySequential(sequential,firmId);
    if (!invoice) {
      throw new InvoiceNotFoundException();
    }
    return invoice;
  }
  async saveMany(
    createInvoiceDtos: CreateBuyingInvoiceDto[],
  ): Promise<BuyingInvoiceEntity[]> {
    const invoices = [];
    for (const createInvoiceDto of createInvoiceDtos) {
      const invoice = await this.save(createInvoiceDto);
      invoices.push(invoice);
    }
    return invoices;
  }
  async patch(
    id: number,
    newData: Partial<UpdateBuyingInvoiceDto>
  ): Promise<BuyingInvoiceEntity> {
    const invoice= await this.findOneById(id)
    return this.buyingInvoiceRepository.save({...invoice,...newData})
  }
  @Transactional()
  async update(
    id: number,
    updateBuyingInvoiceDto: UpdateBuyingInvoiceDto,
  ): Promise<BuyingInvoiceEntity> {
    // Retrieve the existing invoice with necessary relations
    const {referenceDoc:referenceDoc, uploads: existingUploads, ...existingInvoice } =
      await this.findOneByCondition({
        filter: `id||$eq||${id}`,
        join: 'articleInvoiceEntries,invoiceMetaData,uploads,taxWithholding,referenceDoc',
      });

    // Fetch and validate related entities
    const [firm, bankAccount, currency, interlocutor] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateBuyingInvoiceDto.firmId}`,
      }),
      updateBuyingInvoiceDto.bankAccountId
        ? this.bankAccountService.findOneById(updateBuyingInvoiceDto.bankAccountId)
        : null,
      updateBuyingInvoiceDto.currencyId
        ? this.currencyService.findOneById(updateBuyingInvoiceDto.currencyId)
        : null,
      updateBuyingInvoiceDto.interlocutorId
        ? this.interlocutorService.findOneById(updateBuyingInvoiceDto.interlocutorId)
        : null,
    ]);

    // Soft delete old article entries to prepare for new ones
    const existingArticles =
      await this.articleInvoiceEntryService.softDeleteMany(
        existingInvoice.articleInvoiceEntries.map((entry) => entry.id),
      );

    // Save new article entries
    const articleEntries: BuyingArticleInvoiceEntryEntity[] =
      updateBuyingInvoiceDto.articleInvoiceEntries
        ? await this.articleInvoiceEntryService.saveMany(
            updateBuyingInvoiceDto.articleInvoiceEntries,
          )
        : existingArticles;

    // Calculate the subtotal and total for the new entries
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Fetch tax stamp if provided
    const taxStamp = updateBuyingInvoiceDto.taxStampId
      ? await this.taxService.findOneById(updateBuyingInvoiceDto.taxStampId)
      : null;

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateBuyingInvoiceDto.discount,
        updateBuyingInvoiceDto.discount_type,
        taxStamp?.value || 0,
      );

    // Convert article entries to line items for further calculations
    const lineItems = await this.articleInvoiceEntryService.findManyAsLineItem(
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

    // Save or update the invoice metadata with the updated tax summary
    const invoiceMetaData = await this.invoiceMetaDataService.save({
      ...existingInvoice.invoiceMetaData,
      ...updateBuyingInvoiceDto.invoiceMetaData,
      taxSummary,
    });

    // Ensure taxWithholding.rate is valid and calculate the withholding amount
    let taxWithholdingAmount = 0;
    if (updateBuyingInvoiceDto.taxWithholdingId) {
      const taxWithholding = await this.taxWithholdingService.findOneById(
        updateBuyingInvoiceDto.taxWithholdingId,
      );

      if (taxWithholding.rate !== undefined && taxWithholding.rate !== null) {
        taxWithholdingAmount = ciel(
          totalAfterGeneralDiscount * (taxWithholding.rate / 100),
          currency.digitAfterComma + 1,
        );
      }
    }

    // on peut utilise cette fonction: updateAssociations dans les devis
    // Handle uploads - manage existing, new, and eliminated uploads
    const {
      keptItems: keptUploads,
      newItems: newUploads,
      eliminatedItems: eliminatedUploads,
    } = await this.buyingInvoiceRepository.updateAssociations({
      updatedItems: updateBuyingInvoiceDto.uploads,
      existingItems: existingUploads,
      onDelete: (id: number) => this.invoiceUploadService.softDelete(id),
      onCreate: (entity: ResponseBuyingInvoiceUploadDto) =>
        this.invoiceUploadService.save(entity.invoiceId, entity.uploadId),
    });

           // handle refernce document update
        const exist=existingInvoice.referenceDocId==updateBuyingInvoiceDto.referenceDocId;
        let savedReferenceDoc:UploadEntity=null;
        if(!exist){
          existingInvoice.referenceDocId && await this.storageService.delete(referenceDoc.id);
          savedReferenceDoc = await this.storageService.findOneById(updateBuyingInvoiceDto.referenceDocId);
        }

    // Save and return the updated invoice with all updated details
    return this.buyingInvoiceRepository.save({
      ...updateBuyingInvoiceDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      articleInvoiceEntries: articleEntries,
      invoiceMetaData,
      taxStampId: taxStamp ? taxStamp.id : null,
      subTotal,
      taxWithholdingAmount,
      total: totalAfterGeneralDiscount,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
      referenceDocId: savedReferenceDoc?savedReferenceDoc.id:referenceDoc.id,

    });
  }

  async updateFields(
    id: number,
    dict: QueryDeepPartialEntity<BuyingInvoiceEntity>,
  ): Promise<UpdateResult> {
    return this.buyingInvoiceRepository.update(id, dict);
  }

  async duplicate(
    duplicateBuyingInvoiceDto: DuplicateBuyingInvoiceDto,
  ): Promise<ResponseBuyingInvoiceDto> {
    const existingInvoice = await this.findOneByCondition({
      filter: `id||$eq||${duplicateBuyingInvoiceDto.id}`,
      join: new String().concat(
        'invoiceMetaData,',
        'articleInvoiceEntries,',
        'articleInvoiceEntries.articleInvoiceEntryTaxes,',
        'uploads',
      ),
    });
    const invoiceMetaData = await this.invoiceMetaDataService.duplicate(
      existingInvoice.invoiceMetaData.id,
    );
    const{createdAt,updatedAt,deletedAt,...filtredInvoice}=existingInvoice
    const invoice = await this.buyingInvoiceRepository.save({
      ...filtredInvoice,
      id: undefined,
      invoiceMetaData,
      articleInvoiceEntries: [],
      uploads: [],
      amountPaid: 0,
      status: BUYING_INVOICE_STATUS.Draft,
      referenceDoc:null,
      sequential:null
    });

    const articleInvoiceEntries =
      await this.articleInvoiceEntryService.duplicateMany(
        existingInvoice.articleInvoiceEntries.map((entry) => entry.id),
        invoice.id,
      );

    const uploads = duplicateBuyingInvoiceDto.includeFiles
      ? await this.invoiceUploadService.duplicateMany(
          existingInvoice.uploads.map((upload) => upload.id),
          invoice.id,
        )
      : [];

      const referenceDoc = await this.storageService.duplicate(existingInvoice.referenceDocId,);



    return this.buyingInvoiceRepository.save({
      ...invoice,
      articleInvoiceEntries,
      uploads,
      referenceDoc,
    });
  }
  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredInvoices() {
    const currentDate = new Date();
    const expiredInvoices: BuyingInvoiceEntity[] =
      await this.buyingInvoiceRepository.findAll({
        where: {
          status:In([BUYING_INVOICE_STATUS.Validated , BUYING_INVOICE_STATUS.PartiallyPaid , BUYING_INVOICE_STATUS.Unpaid,]) 
        },
      });
    const invoicesToExpire = expiredInvoices.filter((invoice) =>
      isAfter(currentDate, new Date(invoice.dueDate)),
    );

    if (invoicesToExpire.length) {
      for (const invoice of invoicesToExpire) {
        invoice.status = BUYING_INVOICE_STATUS.Expired;
        await this.buyingInvoiceRepository.save(invoice);
      }
    }
  }

  async updateMany(
    updateBuyingInvoiceDtos: UpdateBuyingInvoiceDto[],
  ): Promise<BuyingInvoiceEntity[]> {
    return this.buyingInvoiceRepository.updateMany(updateBuyingInvoiceDtos);
  }

  async softDelete(id: number): Promise<BuyingInvoiceEntity> {
    await this.findOneById(id);
    return this.buyingInvoiceRepository.softDelete(id);
  }

  async deleteAll() {
    return this.buyingInvoiceRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.buyingInvoiceRepository.getTotalCount();
  }

@Transactional()
  async saveFromQuotation(quotation: BuyingQuotationEntity): Promise<BuyingInvoiceEntity> {
    return this.save({
      referenceDocId:null,
      sequential:null,
      quotationId: quotation.id,
      currencyId: quotation.currencyId,
      bankAccountId: quotation.bankAccountId,
      interlocutorId: quotation.interlocutorId,
      firmId: quotation.firmId,
      discount: quotation.discount,
      discount_type: quotation.discount_type,
      object: quotation.object,
      status: BUYING_INVOICE_STATUS.Draft,
      date: new Date(),
      dueDate: null,
      articleInvoiceEntries: quotation.articleQuotationEntries.map((entry) => {
        return {
          unit_price: entry.unit_price,
          quantity: entry.quantity,
          discount: entry.discount,
          discount_type: entry.discount_type,
          subTotal: entry.subTotal,
          total: entry.total,
          articleId: entry.article.id,
          article: entry.article,
          taxes: entry.articleQuotationEntryTaxes.map((entry) => {
            return entry.taxId;
          }),
        };
      }),
    });
  }

  async getPayableAmount(cabinetCurrency: string,firmId?:number): Promise<number> {
    const query =  (await this.buyingInvoiceRepository
      .createQueryBuilder('buyingInvoice'))
      .select('SUM(buyingInvoice.total - buyingInvoice.amountPaid)', 'total')
      .addSelect('currency.code', 'currencyCode') // <- important
      .innerJoin('buyingInvoice.currency', 'currency')
      .where('buyingInvoice.deletedAt IS NULL')
      .andWhere('buyingInvoice.status IN (:...status)', {
        status: [
          BUYING_INVOICE_STATUS.Expired,
          BUYING_INVOICE_STATUS.Unpaid,
          BUYING_INVOICE_STATUS.PartiallyPaid,
          BUYING_INVOICE_STATUS.Validated,
        ],
      })
      .groupBy('currency.code') // <- important
    if(firmId){
      query.andWhere({firmId:firmId})
    }
      const results= await query.getRawMany();
  
    const convertedTotals = await Promise.all(
      results.map(async (result) => {
        const exangeRate= await this.currencyService.getExchangeRate(
          result.currencyCode,
          cabinetCurrency,
        );
        return parseFloat(result.total) * exangeRate;
      }),
    );

    return convertedTotals.reduce((sum, amount) => sum + amount, 0);
  }
  async getFirstInvoiceDate(){
    const first = await this.buyingInvoiceRepository.find({
      order: { date: 'ASC' },
      take: 1,
    });
    if(!first || first.length==0) return null;
    return first[0].date ;
  }    


  async getDiscountTaxWithholding(cabinetCurrency:string,dateFilter?:any,firmId?:number){
    const invoices=await this.buyingInvoiceRepository.findAll({
      where:{
        status: In([BUYING_INVOICE_STATUS.Paid , BUYING_INVOICE_STATUS.PartiallyPaid]),
        deletedAt: null,
        date: dateFilter,
        firmId:firmId
      },
      relations: ['currency','invoiceMetaData'],
    })
    const convertedData = await Promise.all(
      invoices.map(async (invoice) => {
        const exangeRate = await this.currencyService.getHistoExchangeRate(
          cabinetCurrency,
          invoice.currency.code,
          invoice.date
        );
        const discount = invoice.discount_type == 'PERCENTAGE'
          ? invoice.total * (invoice.discount / 100)
          : invoice.discount;
        return [
          discount * exangeRate,
          invoice.invoiceMetaData?.taxSummary?.reduce(
            (sum, item) => sum + (item.amount || 0),
            0
          )*exangeRate,
          invoice.taxWithholdingAmount * exangeRate || 0,
        ];
      })
    );
    
    // Ensuite, on sépare les valeurs :
    const convertedDiscounts = convertedData.map(item => item[0]);
    const convertedTaxs = convertedData.map(item => item[1]);
    const convertedWithholdings = convertedData.map(item => item[2]);
    
    return {
      totalDiscount: convertedDiscounts.reduce((sum, amount) => sum + amount, 0),
      totalTax: convertedTaxs.reduce((sum, amount) => sum + amount, 0),
      totalWithholding: convertedWithholdings.reduce((sum, amount) => sum + amount, 0),
    };
    
  }

  async getAverageOrderValue(cabinetCurrency:string,dateFilter?:any,firmId?:number){
    const invoices=await this.buyingInvoiceRepository.findAll({
      where:{
        status: In([BUYING_INVOICE_STATUS.Paid , BUYING_INVOICE_STATUS.PartiallyPaid]),
        deletedAt: null,
        date: dateFilter,
        firmId:firmId
      },
      relations: ['currency'],
    })
    if(invoices.length===0)return 0
    const convertedAmount = await Promise.all(
      invoices.map(async (invoice) => {
        const exangeRate= await this.currencyService.getExchangeRate(
          invoice.currency.code,
          cabinetCurrency,
        );
        return invoice.total * exangeRate;
      }),
    );
    return convertedAmount.reduce((sum, amount) => sum + amount, 0) / invoices.length ||0;
  }
  async getOverduePaymentsCount(firmId?:number){
    const invoices=await this.buyingInvoiceRepository.findAll({
      where:{
        status: BUYING_INVOICE_STATUS.Expired,
        deletedAt: null,
        firmId:firmId
      },
    })
    return invoices.length;
    
  }
  

  async getRecentInvoices(limit:number,firmId?:number): Promise<BuyingInvoiceEntity[]> {
      const query = (await this.buyingInvoiceRepository
      .createQueryBuilder('invoice'))
      .innerJoinAndSelect('invoice.firm', 'firm')
      .innerJoinAndSelect('invoice.currency', 'currency')
      .orderBy('invoice.date', 'DESC')
      .take(limit)
      .where('invoice.deletedAt IS NULL');

      if(firmId){
        query.andWhere({firmId:firmId})
      }
    return query.getMany();
  }

  async getInvoiceStatus(dateFilter?: any,firmId?:number): Promise<StatusStatsDto[]> {
  const query = (await this.buyingInvoiceRepository
    .createQueryBuilder('invoice'))
    .select('invoice.status', 'status')
    .addSelect('COUNT(invoice.id)', 'count')
    .groupBy('invoice.status')
    .where('invoice.deletedAt IS NULL');

  if (dateFilter) {
    query.andWhere({ date: dateFilter });
  }
  if (firmId) {
    query.andWhere({ firmId:firmId });
  }

  return query.getRawMany();
  }

  async getClientRetentionRate(): Promise<number> {
    const totalClientsQuery =await (await this.buyingInvoiceRepository
      .createQueryBuilder('invoice'))
      .select('COUNT(DISTINCT invoice.firmId)', 'totalClients')
      .where('invoice.deletedAt IS NULL')
      .getRawOne();
    
    const totalClients = Number(totalClientsQuery.totalClients);

    // 2. Obtenir le nombre de clients avec plus d'une facture
    const retainedClientsQuery = await (await this.buyingInvoiceRepository
      .createQueryBuilder('invoice'))
      .select('invoice.firmId', 'firmId')
      .where('invoice.deletedAt IS NULL')
      .groupBy('invoice.firmId')
      .having('COUNT(invoice.id) > 1')
      .getRawMany();

    const retainedClientsCount = retainedClientsQuery.length;

    // 3. Calculer le taux de rétention
    const retentionRate =totalClients!== 0?(retainedClientsCount / totalClients) * 100 :0 ;

    return parseFloat(retentionRate.toFixed(2)); // Retourne le taux avec 2 décimales
  }

  public async getCountsByDate(
    dateFilter?: any,
    firmId?:number
  ): Promise<Array<{ date: string; count: number }>> {
    const queryBuilder = (await this.buyingInvoiceRepository
      .createQueryBuilder('invoice'))
      .select('DATE(invoice.date)', 'date')
      .addSelect('COUNT(invoice.id)', 'count')
      .groupBy('DATE(invoice.date)')
      .orderBy('DATE(invoice.date)', 'ASC')
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


async getQuotationToInvoiceTime(dateFilter?:any,firmId?:number): Promise<number> {

  
  const invoicesWithQuotations = await this.buyingInvoiceRepository.find({
      where: {
          quotationId: Not(IsNull()),
          date: dateFilter,
          deletedAt: null,
          firmId:firmId
      },
      relations: ['quotation'],
  });

  if (invoicesWithQuotations.length === 0) {
      return null;
  }

  let totalDays = 0;
  let count = 0;

  for (const invoice of invoicesWithQuotations) {
      if (invoice.date && invoice.quotation?.date) {
          const diffTime = Math.abs(invoice.date.getTime() - invoice.quotation.date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
          count++;
      }
  }

  return count > 0 ? totalDays / count : null;
}

async getInvoiceToPaymentTime(dateFilter?:any,firmId?:number): Promise<number> {

  const paymentEntries = await this.buyingPaymentInvoiceEntryRepository.find({
      where: dateFilter ? {
          payment: {
              date: dateFilter,
              firmId:firmId
          }
      } : undefined,
      relations: ['invoice', 'payment'],
  });

  if (paymentEntries.length === 0) {
      return null;
  }

  let totalDays = 0;
  let count = 0;

  for (const entry of paymentEntries) {
      if (entry.payment?.date && entry.invoice?.date) {
          const diffTime = Math.abs(entry.payment.date.getTime() - entry.invoice.date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
          count++;
      }
  }

  return count > 0 ? totalDays / count : null;
}
    z
}
