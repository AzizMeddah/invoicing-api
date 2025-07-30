import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { PaymentInvoiceEntryNotFoundException } from '../../errors/payment-invoice-entry.notfound.error';

import { Transactional } from '@nestjs-cls/transactional';
import { createDineroAmountFromFloatWithDynamicCurrency } from 'src/utils/money.utils';
import * as dinero from 'dinero.js';
import { BuyingPaymentInvoiceEntryRepository } from '../repositories/repository/buying-payment-invoice-entry.repository';
import { BuyingPaymentInvoiceEntryEntity } from '../repositories/entities/buying-payment-invoice-entry.entity';
import { BuyingInvoiceService } from 'src/modules/invoice/buying-invoice/services/buying-invoice.service';
import { ResponseBuyingPaymentInvoiceEntryDto } from '../dtos/buying-payment-invoice-entry.response.dto';
import { CreateBuyingPaymentInvoiceEntryDto } from '../dtos/buying-payment-invoice-entry.create.dto';
import { UpdateBuyingPaymentInvoiceEntryDto } from '../dtos/buying-payment-invoice-entry.update.dto';
import { BUYING_INVOICE_STATUS } from 'src/modules/invoice/buying-invoice/enums/buying-invoice-status.enum';

@Injectable()
export class BuyingPaymentInvoiceEntryService {
  constructor(
    private readonly buyingPaymentInvoiceEntryRepository: BuyingPaymentInvoiceEntryRepository,
    private readonly buyingInvoiceService: BuyingInvoiceService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<BuyingPaymentInvoiceEntryEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.buyingPaymentInvoiceEntryRepository.findOne(
      queryOptions as FindOneOptions<BuyingPaymentInvoiceEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(id: number): Promise<ResponseBuyingPaymentInvoiceEntryDto> {
    const entry = await this.buyingPaymentInvoiceEntryRepository.findOneById(id);
    if (!entry) {
      throw new PaymentInvoiceEntryNotFoundException();
    }
    return entry;
  }

  @Transactional()
  async save(
    createPaymentInvoiceEntryDto: CreateBuyingPaymentInvoiceEntryDto,
  ): Promise<BuyingPaymentInvoiceEntryEntity> {
    const existingInvoice = await this.buyingInvoiceService.findOneByCondition({
      filter: `id||$eq||${createPaymentInvoiceEntryDto.invoiceId}`,
      join: 'currency',
    });

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        createPaymentInvoiceEntryDto.digitAfterComma,
      ),
      precision: createPaymentInvoiceEntryDto.digitAfterComma,
    });

    const amountAlreadyPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const taxWithholdingAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.taxWithholdingAmount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const amountToBePaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        createPaymentInvoiceEntryDto.amount,
        createPaymentInvoiceEntryDto.digitAfterComma,
      ),
      precision: createPaymentInvoiceEntryDto.digitAfterComma,
    });

    const totalAmountPaid = amountAlreadyPaid.add(amountToBePaid);

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = totalAmountPaid.equalsTo(zero)
      ? BUYING_INVOICE_STATUS.Unpaid
      : totalAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? BUYING_INVOICE_STATUS.Paid
        : BUYING_INVOICE_STATUS.PartiallyPaid;

    await this.buyingInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: totalAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.buyingPaymentInvoiceEntryRepository.save(
      createPaymentInvoiceEntryDto,
    );
  }

  @Transactional()
  async saveMany(
    createPaymentInvoiceEntryDtos: CreateBuyingPaymentInvoiceEntryDto[],
  ): Promise<BuyingPaymentInvoiceEntryEntity[]> {
    const savedEntries = [];
    for (const dto of createPaymentInvoiceEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  @Transactional()
  async update(
    id: number,
    updatePaymentInvoiceEntryDto: UpdateBuyingPaymentInvoiceEntryDto,
  ): Promise<BuyingPaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneById(id);

    const existingInvoice = await this.buyingInvoiceService.findOneByCondition({
      filter: `id||$eq||${existingEntry.invoiceId}`,
      join: 'currency',
    });

    const currentAmountPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const oldEntryAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingEntry.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const updatedEntryAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        updatePaymentInvoiceEntryDto.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const taxWithholdingAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.taxWithholdingAmount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newAmountPaid = currentAmountPaid
      .subtract(oldEntryAmount)
      .add(updatedEntryAmount);

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = newAmountPaid.equalsTo(zero)
      ? BUYING_INVOICE_STATUS.Unpaid
      : newAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? BUYING_INVOICE_STATUS.Paid
        : BUYING_INVOICE_STATUS.PartiallyPaid;

    await this.buyingInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: newAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.buyingPaymentInvoiceEntryRepository.save({
      ...existingEntry,
      ...updatePaymentInvoiceEntryDto,
    });
  }

  @Transactional()
  async softDelete(id: number): Promise<BuyingPaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'payment',
    });

    const existingInvoice = await this.buyingInvoiceService.findOneByCondition({
      filter: `id||$eq||${existingEntry.invoiceId}`,
      join: 'currency',
    });
    if(existingInvoice) {

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const totalAmountPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const amountToDeduct = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingEntry.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const taxWithholdingAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.taxWithholdingAmount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const updatedAmountPaid = totalAmountPaid.subtract(amountToDeduct);

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = updatedAmountPaid.equalsTo(zero)
      ? BUYING_INVOICE_STATUS.Unpaid
      : updatedAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? BUYING_INVOICE_STATUS.Paid
        : BUYING_INVOICE_STATUS.PartiallyPaid;

    await this.buyingInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: updatedAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });
  }

    return this.buyingPaymentInvoiceEntryRepository.softDelete(id);
  }

  @Transactional()
  async softDeleteMany(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.softDelete(id);
    }
  }
}
