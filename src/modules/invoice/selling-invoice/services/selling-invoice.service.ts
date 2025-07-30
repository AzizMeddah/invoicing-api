import { forwardRef, Inject, Injectable, StreamableFile } from '@nestjs/common';
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

import { SellingInvoiceRepository } from '../repositories/repository/selling-invoice.repository';
import { InvoiceNotFoundException } from '../../errors/invoice.notfound.error';
import { SellingInvoiceEntity } from '../repositories/entities/selling-invoice.entity';
import { ResponseSellingInvoiceDto } from '../dtos/selling-invoice.response.dto';
import { ResponseSellingInvoiceRangeDto } from '../dtos/selling-invoice-range.response.dto';
import { CreateSellingInvoiceDto } from '../dtos/selling-invoice.create.dto';

import { UpdateSellingInvoiceDto } from '../dtos/selling-invoice.update.dto';
import { InvoiceSequence } from '../interfaces/invoice-sequence.interface';
import { DuplicateSellingInvoiceDto } from '../dtos/selling-invoice.duplicate.dto';
import { SellingQuotationEntity } from 'src/modules/quotation/selling-quotation/repositories/entities/selling-quotation.entity';
import { InvoiceSequenceService } from './invoice-sequence.service';
import { SellingInvoiceUploadService } from './selling-invoice-upload.service';
import { SellingInvoiceMetaDataService } from './selling-invoice-meta-data.service';
import { SellingArticleInvoiceEntryService } from './selling-article-invoice-entry.service';
import { UpdateInvoiceSequenceDto } from '../dtos/invoice-seqence.update.dto';
import { ResponseSellingInvoiceUploadDto } from '../dtos/selling-invoice-upload.response.dto';
import { SellingArticleInvoiceEntryEntity } from '../repositories/entities/selling-article-invoice-entry.entity';
import { SELLING_INVOICE_STATUS } from '../enums/selling-invoice-status.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatusStatsDto } from 'src/modules/stats/dto/status-stats.dto';
import { SellingPaymentInvoiceEntryRepository } from 'src/modules/payment/selling-payment/repositories/repository/selling-payment-invoice-entry.repository';
import { CabinetService } from 'src/modules/cabinet/services/cabinet.service';


@Injectable()
export class SellingInvoiceService {
  constructor(
    //repositories
    private readonly sellingInvoiceRepository: SellingInvoiceRepository,
    private readonly sellingPaymentInvoiceEntryRepository: SellingPaymentInvoiceEntryRepository,
    //entity services
    private readonly articleInvoiceEntryService: SellingArticleInvoiceEntryService,
    private readonly invoiceUploadService: SellingInvoiceUploadService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
       @Inject(forwardRef(() => FirmService))
       private readonly firmService: FirmService,
       @Inject(forwardRef(() => InterlocutorService))
       private readonly interlocutorService: InterlocutorService,
    private readonly invoiceSequenceService: InvoiceSequenceService,
    private readonly invoiceMetaDataService: SellingInvoiceMetaDataService,
    private readonly taxService: TaxService,
    private readonly taxWithholdingService: TaxWithholdingService,

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
        private readonly cabinetService:CabinetService
    
  ) { }

  async downloadPdf(id: number, template: string): Promise<StreamableFile> {
    const invoice = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: new String().concat(
        'firm,',
        'cabinet,',
        'currency,',
        'bankAccount,',
        'interlocutor,',
        'cabinet.address,',
        'invoiceMetaData,',
        'firm.deliveryAddress,',
        'firm.invoicingAddress,',
        'articleInvoiceEntries,',
        'articleInvoiceEntries.article,',
        'articleInvoiceEntries.articleInvoiceEntryTaxes,',
        'articleInvoiceEntries.articleInvoiceEntryTaxes.tax',
      ),
    });
    const digitsAferComma = invoice.currency.digitAfterComma;
        const cabinet =await this.cabinetService.findOneById(1)

    if (invoice) {
      const data = {
        meta: {
          ...invoice.invoiceMetaData,
                      logo:cabinet.logo,
          signature:cabinet.signature,
          type: 'Facture',
        },
        invoice: {
          ...invoice,
          date: format(invoice.date, 'dd/MM/yyyy'),
          dueDate: format(invoice.dueDate, 'dd/MM/yyyy'),
          taxSummary: invoice.invoiceMetaData.taxSummary,
          subTotal: invoice.subTotal.toFixed(digitsAferComma),
          total: invoice.total.toFixed(digitsAferComma),
        },
      };

      const pdfBuffer = await this.pdfService.generatePdf(data, 'invoice-' + template);
      return new StreamableFile(pdfBuffer);
    } else {
      throw new InvoiceNotFoundException();
    }
  }

  async findOneById(id: number): Promise<SellingInvoiceEntity> {
    const invoice = await this.sellingInvoiceRepository.findOneById(id);
    if (!invoice) {
      throw new InvoiceNotFoundException();
    }
    return invoice;
  }

  async findOneByCondition(
    query: IQueryObject = {},
  ): Promise<SellingInvoiceEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const invoice = await this.sellingInvoiceRepository.findByCondition(
      queryOptions as FindOneOptions<SellingInvoiceEntity>,
    );
    if (!invoice) return null;
    return invoice;
  }

  async findAll(query: IQueryObject = {}): Promise<SellingInvoiceEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.sellingInvoiceRepository.findAll(
      queryOptions as FindManyOptions<SellingInvoiceEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseSellingInvoiceDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.sellingInvoiceRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.sellingInvoiceRepository.findAll(
      queryOptions as FindManyOptions<SellingInvoiceEntity>,
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

  async findInvoicesByRange(id: number): Promise<ResponseSellingInvoiceRangeDto> {
    // Get the current sequential
    const currentSequential = await this.invoiceSequenceService.get();
    const lastSequence = currentSequential.value.next - 1;

    // fetch the invoice
    const invoice = await this.findOneById(id);
    const { next } = parseSequential(invoice.sequential);

    // determine the previous and next invoices
    const previousInvoice =
      next != 1
        ? await this.findOneByCondition({
          filter: `sequential||$ends||${next - 1}`,
        })
        : null;

    const nextInvoice =
      next != lastSequence
        ? await this.findOneByCondition({
          filter: `sequential||$ends||${next + 1}`,
        })
        : null;

    return {
      next: nextInvoice,
      previous: previousInvoice,
    };
  }

  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredInvoices() {
    const currentDate = new Date();
    const expiredInvoices: SellingInvoiceEntity[] =
      await this.sellingInvoiceRepository.findAll({
        where: {
          status: SELLING_INVOICE_STATUS.Sent || SELLING_INVOICE_STATUS.Unpaid || SELLING_INVOICE_STATUS.PartiallyPaid,
        },
      });
    const invoicesToExpire = expiredInvoices.filter((invoice) =>
      isAfter(currentDate, new Date(invoice.dueDate)),
    );

    if (invoicesToExpire.length) {
      for (const invoice of invoicesToExpire) {
        invoice.status = SELLING_INVOICE_STATUS.Expired;
        await this.sellingInvoiceRepository.save(invoice);
      }
    }
  }

  @Transactional()
  async save(createInvoiceDto: CreateSellingInvoiceDto): Promise<SellingInvoiceEntity> {
    // Parallelize fetching firm, bank account, and currency, as they are independent
    const [firm, bankAccount, currency] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${createInvoiceDto.firmId}`,
      }),
      createInvoiceDto.bankAccountId
        ? this.bankAccountService.findOneById(createInvoiceDto.bankAccountId)
        : Promise.resolve(null),
      createInvoiceDto.currencyId
        ? this.currencyService.findOneById(createInvoiceDto.currencyId)
        : Promise.resolve(null),
    ]);

    if (!firm) {
      throw new Error('Firm not found');
    }

    // Check interlocutor existence
    await this.interlocutorService.findOneById(createInvoiceDto.interlocutorId);

    // Save article entries if provided
    const articleEntries =
      createInvoiceDto.articleInvoiceEntries &&
      (await this.articleInvoiceEntryService.saveMany(
        createInvoiceDto.articleInvoiceEntries,
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
    const taxStamp = createInvoiceDto.taxStampId
      ? await this.taxService.findOneById(createInvoiceDto.taxStampId)
      : null;

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        createInvoiceDto.discount,
        createInvoiceDto.discount_type,
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

    // Fetch the latest sequential number for invoice
    const sequential = await this.invoiceSequenceService.getSequential();

    // Save invoice metadata
    const invoiceMetaData = await this.invoiceMetaDataService.save({
      ...createInvoiceDto.invoiceMetaData,
      taxSummary,
    });

    // Ensure taxWithholding.rate is valid and calculate the withholding amount
    let taxWithholdingAmount = 0;
    if (createInvoiceDto.taxWithholdingId) {
      const taxWithholding = await this.taxWithholdingService.findOneById(
        createInvoiceDto.taxWithholdingId,
      );

      if (taxWithholding.rate !== undefined && taxWithholding.rate !== null) {
        taxWithholdingAmount =
          totalAfterGeneralDiscount * (taxWithholding.rate / 100);
      }
    }

    // Save the invoice entity
    const invoice = await this.sellingInvoiceRepository.save({
      ...createInvoiceDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      //this will be changed to fit with the connected cabinet
      cabinetId: 1,
      sequential,
      articleInvoiceEntries: articleEntries,
      invoiceMetaData,
      subTotal,
      taxWithholdingAmount: taxWithholdingAmount || 0,
      total: totalAfterGeneralDiscount,
    });

    // Handle file uploads if they exist
    if (createInvoiceDto.uploads) {
      await Promise.all(
        createInvoiceDto.uploads.map((u) =>
          this.invoiceUploadService.save(invoice.id, u.uploadId),
        ),
      );
    }

    return invoice;
  }

  async saveMany(
    createInvoiceDtos: CreateSellingInvoiceDto[],
  ): Promise<SellingInvoiceEntity[]> {
    const invoices = [];
    for (const createInvoiceDto of createInvoiceDtos) {
      const invoice = await this.save(createInvoiceDto);
      invoices.push(invoice);
    }
    return invoices;
  }

  @Transactional()
  async saveFromQuotation(quotation: SellingQuotationEntity): Promise<SellingInvoiceEntity> {
    return this.save({
      quotationId: quotation.id,
      currencyId: quotation.currencyId,
      bankAccountId: quotation.bankAccountId,
      interlocutorId: quotation.interlocutorId,
      firmId: quotation.firmId,
      discount: quotation.discount,
      discount_type: quotation.discount_type,
      object: quotation.object,
      status: SELLING_INVOICE_STATUS.Draft,
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
 async patch(
    id: number,
    newData: Partial<UpdateSellingInvoiceDto>
  ): Promise<SellingInvoiceEntity> {
    const invoice= await this.findOneById(id)
    return this.sellingInvoiceRepository.save({...invoice,...newData})
  }
  @Transactional()
  async update(
    id: number,
    updateSellingInvoiceDto: UpdateSellingInvoiceDto,
  ): Promise<SellingInvoiceEntity> {
    // Retrieve the existing invoice with necessary relations
    const { uploads: existingUploads, ...existingInvoice } =
      await this.findOneByCondition({
        filter: `id||$eq||${id}`,
        join: 'articleInvoiceEntries,invoiceMetaData,uploads,taxWithholding',
      });

    // Fetch and validate related entities
    const [firm, bankAccount, currency, interlocutor] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateSellingInvoiceDto.firmId}`,
      }),
      updateSellingInvoiceDto.bankAccountId
        ? this.bankAccountService.findOneById(updateSellingInvoiceDto.bankAccountId)
        : null,
      updateSellingInvoiceDto.currencyId
        ? this.currencyService.findOneById(updateSellingInvoiceDto.currencyId)
        : null,
      updateSellingInvoiceDto.interlocutorId
        ? this.interlocutorService.findOneById(updateSellingInvoiceDto.interlocutorId)
        : null,
    ]);

    // Soft delete old article entries to prepare for new ones
    const existingArticles =
      await this.articleInvoiceEntryService.softDeleteMany(
        existingInvoice.articleInvoiceEntries.map((entry) => entry.id),
      );

    // Save new article entries
    const articleEntries: SellingArticleInvoiceEntryEntity[] =
      updateSellingInvoiceDto.articleInvoiceEntries
        ? await this.articleInvoiceEntryService.saveMany(
          updateSellingInvoiceDto.articleInvoiceEntries,
        )
        : existingArticles;

    // Calculate the subtotal and total for the new entries
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Fetch tax stamp if provided
    const taxStamp = updateSellingInvoiceDto.taxStampId
      ? await this.taxService.findOneById(updateSellingInvoiceDto.taxStampId)
      : null;

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateSellingInvoiceDto.discount,
        updateSellingInvoiceDto.discount_type,
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
      ...updateSellingInvoiceDto.invoiceMetaData,
      taxSummary,
    });

    // Ensure taxWithholding.rate is valid and calculate the withholding amount
    let taxWithholdingAmount = 0;
    if (updateSellingInvoiceDto.taxWithholdingId) {
      const taxWithholding = await this.taxWithholdingService.findOneById(
        updateSellingInvoiceDto.taxWithholdingId,
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
    } = await this.sellingInvoiceRepository.updateAssociations({
      updatedItems: updateSellingInvoiceDto.uploads,
      existingItems: existingUploads,
      onDelete: (id: number) => this.invoiceUploadService.softDelete(id),
      onCreate: (entity: ResponseSellingInvoiceUploadDto) =>
        this.invoiceUploadService.save(entity.invoiceId, entity.uploadId),
    });

    // Save and return the updated invoice with all updated details
    return this.sellingInvoiceRepository.save({
      ...updateSellingInvoiceDto,
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
    });
  }

  async updateFields(
    id: number,
    dict: QueryDeepPartialEntity<SellingInvoiceEntity>,
  ): Promise<UpdateResult> {
    return this.sellingInvoiceRepository.update(id, dict);
  }

  async duplicate(
    duplicateInvoiceDto: DuplicateSellingInvoiceDto,
  ): Promise<ResponseSellingInvoiceDto> {
    const existingInvoice = await this.findOneByCondition({
      filter: `id||$eq||${duplicateInvoiceDto.id}`,
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
    const sequential = await this.invoiceSequenceService.getSequential();
    const invoice = await this.sellingInvoiceRepository.save({
      ...filtredInvoice,
      id: undefined,
      sequential,
      invoiceMetaData,
      articleInvoiceEntries: [],
      uploads: [],
      amountPaid: 0,
      status: SELLING_INVOICE_STATUS.Draft,
    });

    const articleInvoiceEntries =
      await this.articleInvoiceEntryService.duplicateMany(
        existingInvoice.articleInvoiceEntries.map((entry) => entry.id),
        invoice.id,
      );

    const uploads = duplicateInvoiceDto.includeFiles
      ? await this.invoiceUploadService.duplicateMany(
        existingInvoice.uploads.map((upload) => upload.id),
        invoice.id,
      )
      : [];

    return this.sellingInvoiceRepository.save({
      ...invoice,
      articleInvoiceEntries,
      uploads,
    });
  }

  async updateMany(
    updateInvoiceDtos: UpdateSellingInvoiceDto[],
  ): Promise<SellingInvoiceEntity[]> {
    return this.sellingInvoiceRepository.updateMany(updateInvoiceDtos);
  }

  async updateInvoiceSequence(
    updatedSequenceDto: UpdateInvoiceSequenceDto,
  ): Promise<InvoiceSequence> {
    return (await this.invoiceSequenceService.set(updatedSequenceDto)).value;
  }

  async softDelete(id: number): Promise<SellingInvoiceEntity> {
    await this.findOneById(id);
    return this.sellingInvoiceRepository.softDelete(id);
  }

  async deleteAll() {
    return this.sellingInvoiceRepository.deleteAll();
  }

  async getTotal(options?: any): Promise<number> {
    return this.sellingInvoiceRepository.getTotalCount(options);
  }

  async getReceivableAmount(cabinetCurrency: string,firmId?:number): Promise<number> {
    const query =  (await this.sellingInvoiceRepository
      .createQueryBuilder('sellingInvoice'))
      .select('SUM(sellingInvoice.total - sellingInvoice.amountPaid)', 'total')
      .addSelect('currency.code', 'currencyCode') // <- important
      .innerJoin('sellingInvoice.currency', 'currency')
      .where('sellingInvoice.deletedAt IS NULL')
      .andWhere('sellingInvoice.status IN (:...status)', {
        status: [
          SELLING_INVOICE_STATUS.Expired,
          SELLING_INVOICE_STATUS.Unpaid,
          SELLING_INVOICE_STATUS.PartiallyPaid,
          SELLING_INVOICE_STATUS.Sent,
        ],
      })
      .groupBy('currency.code') // <- important

      if (firmId) {
        query.andWhere({ firmId });
      }
      const results = await query.getRawMany();

  
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

  async getFirstInvoiceDate(): Promise<Date> {
    const first = await this.sellingInvoiceRepository.find({
      order: { date: 'ASC' },
      take: 1,
    });
    if(!first || first.length==0) return null;
    return first[0].date ;
  } 

  async getDiscountTaxWithholding(cabinetCurrency:string,dateFilter?:any,firmId?:number){
    const invoices=await this.sellingInvoiceRepository.findAll({
      where:{
        status:In ([SELLING_INVOICE_STATUS.Paid ,SELLING_INVOICE_STATUS.PartiallyPaid,]),
        deletedAt: null,
        date: dateFilter,
        firmId:firmId
      },
      relations: ['currency', 'invoiceMetaData'],
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
          invoice.invoiceMetaData?.taxSummary?.totalTax * exangeRate || 0,
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

  async getAverageBasket(cabinetCurrency:string,dateFilter?:any,firmId?:number){
    const invoices=await this.sellingInvoiceRepository.findAll({
      where:{
        status: In([SELLING_INVOICE_STATUS.Paid , SELLING_INVOICE_STATUS.PartiallyPaid]),
        deletedAt: null,
        date: dateFilter,
        firmId:firmId
      },
      relations: ['currency'],
    })
    if(invoices.length===0)return 0
    const convertedAmount = await Promise.all(
      invoices.map(async (invoice) => {
        const exangeRate = await this.currencyService.getExchangeRate(
          invoice.currency.code,
          cabinetCurrency,
        );
        return invoice.total * exangeRate;
      }),
    );
    return convertedAmount.reduce((sum, amount) => sum + amount, 0) / invoices.length;
  }
  async getOverduePaymentsCount(firmId?:number){
    const invoices=await this.sellingInvoiceRepository.findAll({
      where:{
        status: SELLING_INVOICE_STATUS.Expired,
        deletedAt: null,
        firmId:firmId
      },
    })
    return invoices.length;

  }

  
  async getRecentInvoices(limit:number,firmId?:number): Promise<SellingInvoiceEntity[]> {
      const query = (await this.sellingInvoiceRepository
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
    const query = (await this.sellingInvoiceRepository
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
    const totalClientsQuery = await (await this.sellingInvoiceRepository
      .createQueryBuilder('invoice'))
      .select('COUNT(DISTINCT invoice.firmId)', 'totalClients')
      .where('invoice.deletedAt IS NULL')
      .getRawOne();

    const totalClients = Number(totalClientsQuery.totalClients);

    // 2. Obtenir le nombre de clients avec plus d'une facture
    const retainedClientsQuery = await (await this.sellingInvoiceRepository
      .createQueryBuilder('invoice'))
      .select('invoice.firmId', 'firmId')
      .where('invoice.deletedAt IS NULL')
      .groupBy('invoice.firmId')
      .having('COUNT(invoice.id) > 1')
      .getRawMany();

    const retainedClientsCount = retainedClientsQuery.length;

    // 3. Calculer le taux de rétention
    const retentionRate =totalClients!== 0?(retainedClientsCount / totalClients) * 100 :null;

    return retentionRate ? parseFloat(retentionRate.toFixed(2)) : null; // Retourne le taux avec 2 décimales
  }

  public async getCountsByDate(
    dateFilter?: any,
    firmId?:number

  ): Promise<Array<{ date: string; count: number }>> {
    const queryBuilder = (await this.sellingInvoiceRepository
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
  
    
    const invoicesWithQuotations = await this.sellingInvoiceRepository.find({
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
  
    const paymentEntries = await this.sellingPaymentInvoiceEntryRepository.find({
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
  async findOneBySequential(sequential: string): Promise<SellingInvoiceEntity> {
    const sellinginvoice = await this.sellingInvoiceRepository.findOneBySequential(sequential);
    if (!sellinginvoice) {
      throw new InvoiceNotFoundException();
    }
    return sellinginvoice;
  }
}







