import { forwardRef, Inject, Injectable, StreamableFile } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';

import { PaymentNotFoundException } from '../../errors/payment.notfound.error';

import { Transactional } from '@nestjs-cls/transactional';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { SellingPaymentRepository } from '../repositories/repository/selling-payment.repository';
import { SellingPaymentInvoiceEntryService } from './selling-payment-invoice-entry.service';
import { SellingInvoiceService } from 'src/modules/invoice/selling-invoice/services/selling-invoice.service';
import { SellingPaymentEntity } from '../repositories/entities/selling-payment.entity';
import { ResponseSellingPaymentDto } from '../dtos/selling-payment.response.dto';
import { CreateSellingPaymentDto } from '../dtos/selling-payment.create.dto';
import { UpdateSellingPaymentDto } from '../dtos/selling-payment.update.dto';
import { SellingPaymentUploadService } from './selling-payment-upload.service';
import { ResponseSellingPaymentUploadDto } from '../dtos/selling-payment-upload.response.dto';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format } from 'date-fns';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { th } from '@faker-js/faker';
import { CabinetService } from 'src/modules/cabinet/services/cabinet.service';

@Injectable()
export class SellingPaymentService {
  constructor(
    private readonly sellingPaymentRepository: SellingPaymentRepository,
    private readonly sellingPaymentInvoiceEntryService: SellingPaymentInvoiceEntryService,
    private readonly paymentUploadService: SellingPaymentUploadService,
    private readonly sellingInvoiceService: SellingInvoiceService,
    private readonly currencyService: CurrencyService,
    private readonly pdfService: PdfService,
    @Inject(forwardRef(() => FirmService))

    private readonly firmService: FirmService,
    private readonly cabinetService: CabinetService

  ) { }

  async findOneById(id: number): Promise<SellingPaymentEntity> {
    const payment = await this.sellingPaymentRepository.findOneById(id);
    if (!payment) {
      throw new PaymentNotFoundException();
    }
    return payment;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseSellingPaymentDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const payment = await this.sellingPaymentRepository.findOne(
      queryOptions as FindOneOptions<SellingPaymentEntity>,
    );
    if (!payment) return null;
    return payment;
  }

  async findAll(query: IQueryObject): Promise<ResponseSellingPaymentDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.sellingPaymentRepository.findAll(
      queryOptions as FindManyOptions<SellingPaymentEntity>,
    );

  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseSellingPaymentDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.sellingPaymentRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.sellingPaymentRepository.findAll(
      queryOptions as FindManyOptions<SellingPaymentEntity>,
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
  async find(options: FindManyOptions<SellingPaymentEntity>): Promise<SellingPaymentEntity[]> {
    return this.sellingPaymentRepository.find(options);
  }

  async downloadPdf(id: number, cabinetId: number, template: string): Promise<StreamableFile> {
    const cabinet = await this.cabinetService.findOneById(cabinetId)
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

    const formattedInvoices = (payment.invoices || []).map(async (entry) => {
      const invoice = await this.sellingInvoiceService.findOneByCondition({
        filter: `id||$eq||${entry.invoiceId}`,
        join: 'currency'
      });
      return {
        reference: invoice?.sequential,
        date: invoice?.date ? format(invoice.date, 'dd/MM/yyyy') : '',
        total: invoice?.total?.toFixed(invoice?.currency?.digitAfterComma || 2),
        invoiceCurrency: invoice?.currency?.symbol,
        convertionRate: entry.convertionRate?.toFixed(4) || 1,
        amountPaid: (entry.amount / (entry.convertionRate || 1)).toFixed(digitsAfterComma),
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
        amount: Number(payment.amount.toFixed(digitsAfterComma)) || 0,
        fee: Number(payment.fee?.toFixed(digitsAfterComma)),
        exangeRate: payment.convertionRateToCabinet,
        currency: paymentCurrency,
        mode: payment.mode,
        date: format(payment.date, 'dd/MM/yyyy'),
        cabinetCurrency: cabinet?.currency,
        firm: {
          name: paymentFirm?.name,
        },
      },
      invoices: await Promise.all(formattedInvoices),
    };


    const pdfBuffer = await this.pdfService.generatePdf(data, 'payment-' + template);
    return new StreamableFile(pdfBuffer);
  }

  @Transactional()
  async save(createSellingPaymentDto: CreateSellingPaymentDto): Promise<SellingPaymentEntity> {
    const payment = await this.sellingPaymentRepository.save(createSellingPaymentDto);
    const currency = await this.currencyService.findOneById(payment.currencyId);
    const invoiceEntries = await Promise.all(
      createSellingPaymentDto.invoices.map(async (entry) => {
        const invoice = await this.sellingInvoiceService.findOneById(entry.invoiceId);
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
    await this.sellingPaymentInvoiceEntryService.saveMany(invoiceEntries);
    // Handle file uploads if they exist
    if (createSellingPaymentDto.uploads) {
      await Promise.all(
        createSellingPaymentDto.uploads.map((u) =>
          this.paymentUploadService.save(payment.id, u.uploadId),
        ),
      );
    }
    return payment;
  }

  @Transactional()
  async update(
    id: number,
    updateSellingPaymentDto: UpdateSellingPaymentDto,
  ): Promise<SellingPaymentEntity> {
    const existingPayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices,uploads',
    });
    await this.sellingPaymentInvoiceEntryService.softDeleteMany(
      existingPayment.invoices.map((entry) => entry.id),
    );

    // Handle uploads - manage existing, new, and eliminated uploads
    const {
      keptItems: keptUploads,
      newItems: newUploads,
      eliminatedItems: eliminatedUploads,
    } = await this.sellingPaymentRepository.updateAssociations({
      updatedItems: updateSellingPaymentDto.uploads,
      existingItems: existingPayment.uploads,
      onDelete: (id: number) => this.paymentUploadService.softDelete(id),
      onCreate: (entity: ResponseSellingPaymentUploadDto) =>
        this.paymentUploadService.save(entity.paymentId, entity.uploadId),
    });

    const payment = await this.sellingPaymentRepository.save({
      ...existingPayment,
      ...updateSellingPaymentDto,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });

    const currency = await this.currencyService.findOneById(payment.currencyId);

    const invoiceEntries = await Promise.all(
      updateSellingPaymentDto.invoices.map(async (entry) => {
        const invoice = await this.sellingInvoiceService.findOneById(entry.invoiceId);
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

    await this.sellingPaymentInvoiceEntryService.saveMany(invoiceEntries);

    return payment;
  }

  @Transactional()
  async softDelete(id: number): Promise<SellingPaymentEntity> {
    const existingPayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices',
    });
    await this.sellingPaymentInvoiceEntryService.softDeleteMany(
      existingPayment.invoices.map((invoice) => invoice.id),
    );
    return this.sellingPaymentRepository.softDelete(id);
  }

  async deleteAll() {
    return this.sellingPaymentRepository.deleteAll();
  }

  async getTotal(options?: any): Promise<number> {
    return this.sellingPaymentRepository.getTotalCount(options);
  }

  async getTotalIncomes(dateFilter?: any, firmId?: number): Promise<number> {
    return this.sellingPaymentRepository.getTotal(dateFilter, firmId);
  }


  async getRecentPayments(limit: number, firmId?: number): Promise<SellingPaymentEntity[]> {
    const query = (await this.sellingPaymentRepository
      .createQueryBuilder('payment'))
      .innerJoinAndSelect('payment.firm', 'firm')
      .innerJoinAndSelect('payment.currency', 'currency')
      .orderBy('payment.date', 'DESC')
      .take(limit)
      .where('payment.deletedAt IS NULL');

    if (firmId) {
      query.andWhere({ firmId: firmId })
    }
    return query.getMany();
  }

  public async getCountsByDate(
    dateFilter?: any,
    firmId?: number
  ): Promise<Array<{ date: string; count: number }>> {
    const queryBuilder = (await this.sellingPaymentRepository
      .createQueryBuilder('payment'))
      .select('DATE(payment.date)', 'date')
      .addSelect('COUNT(payment.id)', 'count')
      .groupBy('DATE(payment.date)')
      .orderBy('DATE(payment.date)', 'ASC')
    if (dateFilter) {
      queryBuilder.andWhere({ date: dateFilter });
    }
    if (firmId) {
      queryBuilder.andWhere({ firmId: firmId });
    }
    const results = await queryBuilder.getRawMany();

    return results.map(item => ({
      date: item.date,
      count: parseInt(item.count)
    }));
  }
}
