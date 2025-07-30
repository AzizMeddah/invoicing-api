import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { PaymentInvoiceEntryNotFoundException } from '../../errors/payment-invoice-entry.notfound.error';
import { Transactional } from '@nestjs-cls/transactional';
import { createDineroAmountFromFloatWithDynamicCurrency } from 'src/utils/money.utils';
import * as dinero from 'dinero.js';
import { SellingPaymentInvoiceEntryRepository } from '../repositories/repository/selling-payment-invoice-entry.repository';
import { SellingInvoiceService } from 'src/modules/invoice/selling-invoice/services/selling-invoice.service';
import { SellingPaymentInvoiceEntryEntity } from '../repositories/entities/selling-payment-invoice-entry.entity';
import { ResponseSellingPaymentInvoiceEntryDto } from '../dtos/selling-payment-invoice-entry.response.dto';
import { CreateSellingPaymentInvoiceEntryDto } from '../dtos/selling-payment-invoice-entry.create.dto';
import { UpdateSellingPaymentInvoiceEntryDto } from '../dtos/selling-payment-invoice-entry.update.dto';
import { SELLING_INVOICE_STATUS } from 'src/modules/invoice/selling-invoice/enums/selling-invoice-status.enum';
import e from 'express';

@Injectable()
export class SellingPaymentInvoiceEntryService {
  constructor(
    private readonly sellingPaymentInvoiceEntryRepository: SellingPaymentInvoiceEntryRepository,
    private readonly sellingInvoiceService: SellingInvoiceService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<SellingPaymentInvoiceEntryEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.sellingPaymentInvoiceEntryRepository.findOne(
      queryOptions as FindOneOptions<SellingPaymentInvoiceEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(id: number): Promise<ResponseSellingPaymentInvoiceEntryDto> {
    const entry = await this.sellingPaymentInvoiceEntryRepository.findOneById(id);
    if (!entry) {
      throw new PaymentInvoiceEntryNotFoundException();
    }
    return entry;
  }

  @Transactional()
  async save(
    createPaymentInvoiceEntryDto: CreateSellingPaymentInvoiceEntryDto,
  ): Promise<SellingPaymentInvoiceEntryEntity> {
    const existingInvoice = await this.sellingInvoiceService.findOneByCondition({
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
      ? SELLING_INVOICE_STATUS.Unpaid
      : totalAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? SELLING_INVOICE_STATUS.Paid
        : SELLING_INVOICE_STATUS.PartiallyPaid;

    await this.sellingInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: totalAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.sellingPaymentInvoiceEntryRepository.save(
      createPaymentInvoiceEntryDto,
    );
  }

  @Transactional()
  async saveMany(
    createPaymentInvoiceEntryDtos: CreateSellingPaymentInvoiceEntryDto[],
  ): Promise<SellingPaymentInvoiceEntryEntity[]> {
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
    updatePaymentInvoiceEntryDto: UpdateSellingPaymentInvoiceEntryDto,
  ): Promise<SellingPaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneById(id);

    const existingInvoice = await this.sellingInvoiceService.findOneByCondition({
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
      ? SELLING_INVOICE_STATUS.Unpaid
      : newAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? SELLING_INVOICE_STATUS.Paid
        : SELLING_INVOICE_STATUS.PartiallyPaid;

    await this.sellingInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: newAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.sellingPaymentInvoiceEntryRepository.save({
      ...existingEntry,
      ...updatePaymentInvoiceEntryDto,
    });
  }

  @Transactional()
  async softDelete(id: number): Promise<SellingPaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'payment',
    });

    const existingInvoice = await this.sellingInvoiceService.findOneByCondition({
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
      ? SELLING_INVOICE_STATUS.Unpaid
      : updatedAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? SELLING_INVOICE_STATUS.Paid
        : SELLING_INVOICE_STATUS.PartiallyPaid;

    await this.sellingInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: updatedAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });}

    return this.sellingPaymentInvoiceEntryRepository.softDelete(id);
  }

  @Transactional()
  async softDeleteMany(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.softDelete(id);
    }
  }
}
