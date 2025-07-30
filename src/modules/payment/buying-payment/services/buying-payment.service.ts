import { forwardRef, Inject, Injectable, StreamableFile } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';

import { PaymentNotFoundException } from '../../errors/payment.notfound.error';

import { Transactional } from '@nestjs-cls/transactional';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { BuyingPaymentRepository } from '../repositories/repository/buying-payment.repository';
import { BuyingPaymentInvoiceEntryService } from './buying-payment-invoice-entry.service';
import { BuyingPaymentEntity } from '../repositories/entities/buying-payment.entity';
import { ResponseBuyingPaymentDto } from '../dtos/buying-payment.response.dto';
import { CreateBuyingPaymentDto } from '../dtos/buying-payment.create.dto';
import { UpdateBuyingPaymentDto } from '../dtos/buying-payment.update.dto';
import { BuyingInvoiceService } from 'src/modules/invoice/buying-invoice/services/buying-invoice.service';
import { BuyingPaymentUploadService } from './buying-payment-upload.service';
import { ResponseBuyingPaymentUploadDto } from '../dtos/buying-payment-upload.response.dto';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format } from 'date-fns';
import { CabinetService } from 'src/modules/cabinet/services/cabinet.service';

@Injectable()
export class BuyingPaymentService {
  constructor(
    private readonly buyingPaymentRepository: BuyingPaymentRepository,
    private readonly buyingPaymentInvoiceEntryService: BuyingPaymentInvoiceEntryService,
    private readonly paymentUploadService: BuyingPaymentUploadService,
    private readonly buyingInvoiceService: BuyingInvoiceService,
    private readonly currencyService: CurrencyService,
    private readonly pdfService: PdfService,
        @Inject(forwardRef(() => FirmService))
    private readonly firmService: FirmService,
        private readonly cabinetService : CabinetService
  
        
  ) {}

  async findOneById(id: number): Promise<BuyingPaymentEntity> {
    const payment = await this.buyingPaymentRepository.findOneById(id);
    if (!payment) {
      throw new PaymentNotFoundException();
    }
    return payment;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseBuyingPaymentDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const payment = await this.buyingPaymentRepository.findOne(
      queryOptions as FindOneOptions<BuyingPaymentEntity>,
    );
    if (!payment) return null;
    return payment;
  }

  async findAll(query: IQueryObject): Promise<ResponseBuyingPaymentDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.buyingPaymentRepository.findAll(
      queryOptions as FindManyOptions<BuyingPaymentEntity>,
    );
 
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseBuyingPaymentDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.buyingPaymentRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.buyingPaymentRepository.findAll(
      queryOptions as FindManyOptions<BuyingPaymentEntity>,
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
  async find(options: FindManyOptions<BuyingPaymentEntity>): Promise<BuyingPaymentEntity[]> {
    return this.buyingPaymentRepository.find(options);
  }
  
  async downloadPdf(id: number,cabinetId:number, template: string): Promise<StreamableFile> {
    const cabinet= await this.cabinetService.findOneById(cabinetId)
    const payment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: new String().concat(
        'firm,',
        'currency,',
        'invoices,',
        'invoices.invoice,',
        'invoices.invoice.currency',
      ),
    });
  
    if (!payment) {
      throw new PaymentNotFoundException();
    }
  
    const paymentCurrency = await this.currencyService.findOneById(
      payment.currencyId,
    );
    const digitsAfterComma = paymentCurrency?.digitAfterComma || 2;
  
    const formattedInvoices = (payment.invoices || []).map(async(entry) => {
      const invoice = await this.buyingInvoiceService.findOneByCondition({
        filter: `id||$eq||${entry.invoiceId}`,
        join: 'currency'});
      return {
        reference: invoice?.sequential,
        date: invoice?.date ? format(invoice.date, 'dd/MM/yyyy') : '',
        total: invoice?.total?.toFixed(invoice?.currency?.digitAfterComma|| 2),
        invoiceCurrency: invoice?.currency?.symbol,
        convertionRate: entry.convertionRate?.toFixed(4)||1,
        amountPaid: (entry.amount/ (entry.convertionRate || 1)).toFixed(digitsAfterComma),
        remainingAmount: (invoice?.total - entry.amount).toFixed(digitsAfterComma),
      };
    });
    const paymentFirm = await this.firmService.findOneById(
      payment.firmId,
      ['currency']
    );
  
    const data = {
      meta: {
        logo: cabinet.logo,
        signature: cabinet.signature,
      },
      payment: {
        id: payment.id,
        amount:Number( payment.amount.toFixed(digitsAfterComma)) || 0,  
        fee:Number( payment.fee?.toFixed(digitsAfterComma)),
        exangeRate:payment.convertionRateToCabinet,
        currency: paymentCurrency,
        mode: payment.mode,
        date: format(payment.date, 'dd/MM/yyyy'),
        cabinetCurrency:cabinet?.currency,
        firm: {
          name: paymentFirm?.name,
          currency:paymentFirm?.currency,
        },
      },
      invoices: await Promise.all(formattedInvoices),
    };

  
    const pdfBuffer = await this.pdfService.generatePdf(data, 'payment-' + template);
    return new StreamableFile(pdfBuffer);
  }

  @Transactional()
  async save(createBuyingPaymentDto: CreateBuyingPaymentDto): Promise<BuyingPaymentEntity> {
    const payment = await this.buyingPaymentRepository.save(createBuyingPaymentDto);
    const currency = await this.currencyService.findOneById(payment.currencyId);
    const invoiceEntries = await Promise.all(
      createBuyingPaymentDto.invoices.map(async (entry) => {
        const invoice = await this.buyingInvoiceService.findOneById(entry.invoiceId);
        return {
          paymentId: payment.id,
          invoiceId: entry.invoiceId,
          amount:
            entry.amount *
            (invoice.currencyId !== payment.currencyId
              ? entry.convertionRate
              : 1),
          digitAfterComma: currency.digitAfterComma,
          convertionRate: entry.convertionRate,
        };
      }),
    );
    await this.buyingPaymentInvoiceEntryService.saveMany(invoiceEntries);
    // Handle file uploads if they exist
    if (createBuyingPaymentDto.uploads) {
      await Promise.all(
        createBuyingPaymentDto.uploads.map((u) =>
          this.paymentUploadService.save(payment.id, u.uploadId),
        ),
      );
    }
    return payment;
  }

  @Transactional()
  async update(
    id: number,
    updateBuyingPaymentDto: UpdateBuyingPaymentDto,
  ): Promise<BuyingPaymentEntity> {
    const existingPayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices,uploads',
    });
    await this.buyingPaymentInvoiceEntryService.softDeleteMany(
      existingPayment.invoices.map((entry) => entry.id),
    );

    // Handle uploads - manage existing, new, and eliminated uploads
    const {
      keptItems: keptUploads,
      newItems: newUploads,
      eliminatedItems: eliminatedUploads,
    } = await this.buyingPaymentRepository.updateAssociations({
      updatedItems: updateBuyingPaymentDto.uploads,
      existingItems: existingPayment.uploads,
      onDelete: (id: number) => this.paymentUploadService.softDelete(id),
      onCreate: (entity: ResponseBuyingPaymentUploadDto) =>
        this.paymentUploadService.save(entity.paymentId, entity.uploadId),
    });

    const payment = await this.buyingPaymentRepository.save({
      ...existingPayment,
      ...updateBuyingPaymentDto,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });

    const currency = await this.currencyService.findOneById(payment.currencyId);

    const invoiceEntries = await Promise.all(
      updateBuyingPaymentDto.invoices.map(async (entry) => {
        const invoice = await this.buyingInvoiceService.findOneById(entry.invoiceId);
        return {
          paymentId: payment.id,
          invoiceId: entry.invoiceId,
          amount:
            entry.amount *
            (invoice.currencyId !== payment.currencyId
              ? entry.convertionRate
              : 1),
          digitAfterComma: currency.digitAfterComma,
          convertionRate: entry.convertionRate,
        };
      }),
    );

    await this.buyingPaymentInvoiceEntryService.saveMany(invoiceEntries);

    return payment;
  }

  @Transactional()
  async softDelete(id: number): Promise<BuyingPaymentEntity> {
    const existingPayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices',
    });
    await this.buyingPaymentInvoiceEntryService.softDeleteMany(
      existingPayment.invoices.map((invoice) => invoice.id),
    );
    return this.buyingPaymentRepository.softDelete(id);
  }

  async deleteAll() {
    return this.buyingPaymentRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.buyingPaymentRepository.getTotalCount();
  }

  async getTotalExpenses(dateFilter?:any,firmId?:number): Promise<number> {
    return this.buyingPaymentRepository.getTotal(dateFilter,firmId);
  }

  async getRecentPayments(limit:number,firmId?:number): Promise<BuyingPaymentEntity[]> {
    const query = (await this.buyingPaymentRepository
      .createQueryBuilder('payment'))
      .innerJoinAndSelect('payment.firm', 'firm')
      .innerJoinAndSelect('payment.currency', 'currency')
      .orderBy('payment.date', 'DESC')
      .take(limit)
      .where('payment.deletedAt IS NULL');

      if(firmId){
        query.andWhere({firmId:firmId})
      }
    return query.getMany();
  }

  public async getCountsByDate(
    dateFilter?: any,
    firmId?:number
  ): Promise<Array<{ date: string; count: number }>> {
    const queryBuilder = (await this.buyingPaymentRepository
      .createQueryBuilder('payment'))
      .select('DATE(payment.date)', 'date')
      .addSelect('COUNT(payment.id)', 'count')
      .groupBy('DATE(payment.date)')
      .orderBy('DATE(payment.date)', 'ASC')
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
}
