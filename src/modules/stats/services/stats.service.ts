import { Injectable } from '@nestjs/common';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { BuyingInvoiceService } from 'src/modules/invoice/buying-invoice/services/buying-invoice.service';
import { SellingInvoiceService } from 'src/modules/invoice/selling-invoice/services/selling-invoice.service';
import { BuyingPaymentService } from 'src/modules/payment/buying-payment/services/buying-payment.service';
import { SellingPaymentService } from 'src/modules/payment/selling-payment/services/selling-payment.service';
import { differenceInDays, format } from 'date-fns';
import { Between, MoreThanOrEqual } from 'typeorm';
import { MonthlyFluxDto } from '../dto/monthly-flux.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { get } from 'http';
import { ResponseGlobalStatsDto } from '../dto/global-stats.response.dto';
import { GetStatsDto } from '../dto/stats-get.dto';
import { ResponseSellingStatsDto } from '../dto/selling-stats.response.dto';
import { BuyingQuotationService } from 'src/modules/quotation/buying-quotation/services/buying-quotation.service';
import { SellingQuotationService } from 'src/modules/quotation/selling-quotation/services/selling-quotation.service';
import { StatusStatsDto } from '../dto/status-stats.dto';
import { th } from '@faker-js/faker';
import { ResponseBuyingStatsDto } from '../dto/buying-stats.response.dto';
import { ResponseClientStatsDto } from '../dto/client-stats.response.dto';
import { stat } from 'fs/promises';
import { ResponseSupplierStatsDto } from '../dto/supplier-stats.response.dto';
import { LoggerService } from 'src/common/logger/services/logger.service';
import { LoggerEntity } from 'src/common/logger/repositories/entities/logger.entity';
import {
  startOfWeek,
  startOfMonth,
  parseISO,
  getHours,
  isAfter,
} from 'date-fns';
import * as _ from 'lodash';

@Injectable()
export class StatsService {
  constructor(
    private readonly buyingPaymentService: BuyingPaymentService,
    private readonly sellingPaymentService: SellingPaymentService,
    private readonly buyingInvoiceService: BuyingInvoiceService,
    private readonly sellingInvoiceService: SellingInvoiceService,
    private readonly buyingQuotationService: BuyingQuotationService,
    private readonly sellingQuotationService: SellingQuotationService,
    private readonly firmService: FirmService,
    private readonly currencyService: CurrencyService,
    private readonly loggerService: LoggerService,
  ) {}

  //---------------------------------GLOBAL
  async getGlobalDashboard(
    getGlobalStatsDto: GetStatsDto,
  ): Promise<ResponseGlobalStatsDto> {
    const dateFilter = this.buildDateFilter(getGlobalStatsDto.period);

    const [
      totalExpenses,
      totalIncomes,
      topClients,
      topSuppliers,
      payableAmount,
      receivableAmount,
      fluxData,
      histoTotalExpenses,
      histoTotalIncomes,
      firstBuyingInvoiceDate,
      firstSellingInvoiceDate,
    ] = await Promise.all([
      this.buyingPaymentService.getTotalExpenses(dateFilter),
      this.sellingPaymentService.getTotalIncomes(dateFilter),
      this.firmService.getTopClients(getGlobalStatsDto.topClientNb, dateFilter),
      this.firmService.getTopSuppliers(
        getGlobalStatsDto.topSupplierNb,
        dateFilter,
      ),
      this.buyingInvoiceService.getPayableAmount(
        getGlobalStatsDto.cabinetCurrency,
      ),
      this.sellingInvoiceService.getReceivableAmount(
        getGlobalStatsDto.cabinetCurrency,
      ),
      this.getFlux(getGlobalStatsDto.period),
      this.buyingPaymentService.getTotalExpenses(),
      this.sellingPaymentService.getTotalIncomes(),
      this.buyingInvoiceService.getFirstInvoiceDate(),
      this.sellingInvoiceService.getFirstInvoiceDate(),
    ]);

    const netProfit = totalIncomes - totalExpenses;
    const netMargin = totalIncomes > 0 ? (netProfit / totalIncomes) * 100 : 0;

    const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

    const totalBuyingDays = differenceInDays(
      new Date(),
      firstBuyingInvoiceDate,
    );
    const totalSellingDays = differenceInDays(
      new Date(),
      firstSellingInvoiceDate,
    );

    const dpo =
      histoTotalExpenses > 0
        ? (payableAmount / histoTotalExpenses) * totalBuyingDays
        : null;
    const dso =
      histoTotalIncomes > 0
        ? (receivableAmount / histoTotalIncomes) * totalSellingDays
        : null;

    return {
      totalExpenses,
      totalIncome: totalIncomes,
      netProfit,
      netMargin,
      topClients,
      topSuppliers,
      payableAmount,
      receivableAmount,
      dpo,
      dso,
      roi,
      salesMonthlyFlux: this.convertToMonthlyFluxDto(fluxData.sales),
      purchasesMonthlyFlux: this.convertToMonthlyFluxDto(fluxData.purchases),
    };
  }
  private convertToMonthlyFluxDto(
    data: Record<string, number>,
  ): MonthlyFluxDto[] {
    return Object.entries(data).map(([month, amount]) => ({
      month,
      amount,
    }));
  }
  async getFlux(period?: string, firmId?: number) {
    const dateFilter = this.buildDateFilter(period);

    const [sales, purchases] = await Promise.all([
      this.sellingPaymentService.find({
        where: {
          date: dateFilter,
          firmId: firmId,
        },
        order: { date: 'ASC' },
      }),
      this.buyingPaymentService.find({
        where: {
          date: dateFilter,
          firmId: firmId,
        },
        order: { date: 'ASC' },
      }),
    ]);

    return {
      sales: this.groupByTimePeriod(sales, period),
      purchases: this.groupByTimePeriod(purchases, period),
    };
  }

  //----------------------------------SELLING
  async getSellingDashboard(
    statsParams: GetStatsDto,
  ): Promise<ResponseSellingStatsDto> {
    const dateFilter = this.buildDateFilter(statsParams.period);

    const [
      financialMetrics,
      processMetrics,
      statusStats,
      recentActivities,
      countTrends,
    ] = await Promise.all([
      this.getSellingFinancialMetrics(statsParams.cabinetCurrency, dateFilter),
      this.getSellingProcessMetrics(dateFilter),
      this.getStatusStatistics(dateFilter),
      this.getRecentActivities('selling'),
      this.getCountTrends('selling', statsParams.period),
    ]);

    return {
      financialMetrics,
      processMetrics,
      statusStatistics: statusStats,
      recentActivities: recentActivities,
      countTrends: countTrends,
    };
  }
  private async getSellingFinancialMetrics(
    currency: string,
    dateFilter?: any,
    firmId?: number,
  ) {
    const [
      totalIncome,
      dtwIndicators,
      averageBasket,
      overduePayments,
      receivableAmount,
    ] = await Promise.all([
      this.sellingPaymentService.getTotalIncomes(dateFilter, firmId),
      this.sellingInvoiceService.getDiscountTaxWithholding(
        currency,
        dateFilter,
        firmId,
      ),
      this.sellingInvoiceService.getAverageBasket(currency, dateFilter, firmId),
      this.sellingInvoiceService.getOverduePaymentsCount(firmId),
      this.sellingInvoiceService.getReceivableAmount(currency, firmId),
    ]);

    return {
      totalIncome,
      ...dtwIndicators,
      averageBasket,
      overduePayments,
      receivableAmount,
    };
  }
  private async getSellingProcessMetrics(dateFilter?: any, firmId?: number) {
    const [
      conversionRate,
      acceptanceRate,
      quotationRejectionRate,
      clientRetentionRate,
      quotationToInvoiceTime,
      invoiceToPaymentTime,
    ] = await Promise.all([
      this.sellingQuotationService.getConversionRate(dateFilter, firmId),
      this.sellingQuotationService.getAcceptanceRate(dateFilter, firmId),
      this.sellingQuotationService.getRejectionRate(dateFilter, firmId),
      this.sellingInvoiceService.getClientRetentionRate(),
      this.sellingInvoiceService.getQuotationToInvoiceTime(dateFilter, firmId),
      this.sellingInvoiceService.getInvoiceToPaymentTime(dateFilter, firmId),
    ]);

    return {
      quotationToInvoice: conversionRate,
      quotationAcceptance: acceptanceRate,
      quotationRejection: quotationRejectionRate,
      clientRetention: clientRetentionRate,
      quotationToInvoiceTime,
      invoiceToPaymentTime,
    };
  }

  //----------------------------------BUYING

  async getBuyingDashboard(
    statsParams: GetStatsDto,
  ): Promise<ResponseBuyingStatsDto> {
    const dateFilter = this.buildDateFilter(statsParams.period);
    const [
      financialMetrics,
      processMetrics,
      statusStatistics,
      recentActivities,
      countTrends,
    ] = await Promise.all([
      this.getBuyingFinancialMetrics(statsParams.cabinetCurrency, dateFilter),
      this.getBuyingProcessMetrics(dateFilter),
      this.getStatusStatistics('buying', dateFilter),
      this.getRecentActivities('buying'),
      this.getCountTrends('buying', statsParams.period),
    ]);
    return {
      financialMetrics,
      processMetrics,
      statusStatistics,
      recentActivities,
      countTrends,
    };
  }
  private async getBuyingFinancialMetrics(
    currency: string,
    dateFilter?: any,
    firmId?: number,
  ) {
    const [
      totalExpenses,
      dtwIndicators,
      averageOrderValue,
      overduePayments,
      payableAmount,
    ] = await Promise.all([
      this.buyingPaymentService.getTotalExpenses(dateFilter, firmId),
      this.buyingInvoiceService.getDiscountTaxWithholding(
        currency,
        dateFilter,
        firmId,
      ),
      this.buyingInvoiceService.getAverageOrderValue(
        currency,
        dateFilter,
        firmId,
      ),
      this.buyingInvoiceService.getOverduePaymentsCount(firmId),
      this.buyingInvoiceService.getPayableAmount(currency, firmId),
    ]);
    return {
      totalExpenses,
      ...dtwIndicators,
      averageOrderValue,
      overduePayments,
      payableAmount,
    };
  }
  private async getBuyingProcessMetrics(dateFilter?: any, firmId?: number) {
    const [quotationToInvoice, quotationToInvoiceTime, invoiceToPaymentTime] =
      await Promise.all([
        this.buyingQuotationService.getConversionRate(dateFilter, firmId),
        this.buyingInvoiceService.getQuotationToInvoiceTime(dateFilter, firmId),
        this.buyingInvoiceService.getInvoiceToPaymentTime(dateFilter, firmId),
      ]);

    return {
      quotationToInvoice,
      quotationToInvoiceTime,
      invoiceToPaymentTime,
    };
  }

  //----------------------------------Client
  async getClientDashboard(
    statsParams: GetStatsDto,
  ): Promise<ResponseClientStatsDto> {
    const dateFilter = this.buildDateFilter(statsParams.period);

    const [
      financialMetrics,
      processMetrics,
      statusStats,
      recentActivities,
      countTrends,
      fluxData,
    ] = await Promise.all([
      this.getSellingFinancialMetrics(
        statsParams.cabinetCurrency,
        dateFilter,
        statsParams.firmId,
      ),
      this.getSellingProcessMetrics(dateFilter, statsParams.firmId),
      this.getStatusStatistics('selling', dateFilter, statsParams.firmId),
      this.getRecentActivities('selling', statsParams.firmId),
      this.getCountTrends('selling', statsParams.period, statsParams.firmId),
      this.getFlux(statsParams.period, statsParams.firmId),
    ]);

    return {
      financialMetrics,
      processMetrics: {
        quotationAcceptance: processMetrics.quotationAcceptance,
        quotationRejection: processMetrics.quotationRejection,
        quotationToInvoice: processMetrics.quotationToInvoice,
        quotationToInvoiceTime: processMetrics.quotationToInvoiceTime,
        invoiceToPaymentTime: processMetrics.invoiceToPaymentTime,
      },
      statusStatistics: statusStats,
      recentActivities: recentActivities,
      countTrends: countTrends,
      salesMonthlyFlux: this.convertToMonthlyFluxDto(fluxData.sales),
      purchasesMonthlyFlux: this.convertToMonthlyFluxDto(fluxData.purchases),
    };
  }

  //----------------------------------Supplier
  async getSupplierDashboard(
    statsParams: GetStatsDto,
  ): Promise<ResponseSupplierStatsDto> {
    const dateFilter = this.buildDateFilter(statsParams.period);
    const [
      financialMetrics,
      processMetrics,
      statusStatistics,
      recentActivities,
      countTrends,
      fluxData,
    ] = await Promise.all([
      this.getBuyingFinancialMetrics(
        statsParams.cabinetCurrency,
        dateFilter,
        statsParams.firmId,
      ),
      this.getBuyingProcessMetrics(dateFilter, statsParams.firmId),
      this.getStatusStatistics('buying', dateFilter, statsParams.firmId),
      this.getRecentActivities('buying', statsParams.firmId),
      this.getCountTrends('buying', statsParams.period, statsParams.firmId),
      this.getFlux(statsParams.period, statsParams.firmId),
    ]);
    return {
      financialMetrics,
      processMetrics,
      statusStatistics,
      recentActivities,
      countTrends,
      salesMonthlyFlux: this.convertToMonthlyFluxDto(fluxData.sales),
      purchasesMonthlyFlux: this.convertToMonthlyFluxDto(fluxData.purchases),
    };
  }

  //-------------------------------Utilities Methode
  private async getStatusStatistics(
    type: string,
    dateFilter?: any,
    firmId?: number,
  ) {
    const quotationStatus =
      type == 'selling'
        ? await this.sellingQuotationService.getQuotationStatus(
            dateFilter,
            firmId,
          )
        : await this.buyingQuotationService.getQuotationStatus(
            dateFilter,
            firmId,
          );
    const invoiceStatus =
      type == 'selling'
        ? await this.sellingInvoiceService.getInvoiceStatus(dateFilter, firmId)
        : await this.buyingInvoiceService.getInvoiceStatus(dateFilter, firmId);
    return {
      quotations: quotationStatus,
      invoices: invoiceStatus,
    };
  }
  private async getRecentActivities(type: string, firmId?: number, limit = 20) {
    const recentQuotations =
      type == 'selling'
        ? await this.sellingQuotationService.getRecentQuotations(limit, firmId)
        : await this.buyingQuotationService.getRecentQuotations(limit, firmId);
    const recentInvoices =
      type == 'selling'
        ? await this.sellingInvoiceService.getRecentInvoices(limit, firmId)
        : await this.buyingInvoiceService.getRecentInvoices(limit, firmId);
    const recentPayments =
      type == 'selling'
        ? await this.sellingPaymentService.getRecentPayments(limit, firmId)
        : await this.buyingPaymentService.getRecentPayments(limit, firmId);

    return {
      quotations: recentQuotations,
      invoices: recentInvoices,
      payments: recentPayments,
    };
  }
  private async getCountTrends(type: string, period: string, firmId?: number) {
    const trends = await this.getCountFlux(type, period, firmId);
    return {
      quotations: trends.quotations,
      invoices: trends.invoices,
      payments: trends.payments,
    };
  }
  async getCountFlux(type: string, period: string, firmId?: number) {
    const dateFilter = this.buildDateFilter(period);

    const [quotations, invoices, payments] = await Promise.all([
      type == 'selling'
        ? this.sellingQuotationService.getCountsByDate(dateFilter, firmId)
        : this.buyingQuotationService.getCountsByDate(dateFilter, firmId),
      type == 'selling'
        ? this.sellingInvoiceService.getCountsByDate(dateFilter, firmId)
        : this.buyingInvoiceService.getCountsByDate(dateFilter, firmId),
      type == 'selling'
        ? this.sellingPaymentService.getCountsByDate(dateFilter, firmId)
        : this.buyingPaymentService.getCountsByDate(dateFilter, firmId),
    ]);

    return { quotations, invoices, payments };
  }

  /*private groupCountByTimePeriod(
    data: { date: string | Date; count: number;}[],
    period?: string
  ): Record<string, number> {
    const periodFormat = this.getPeriodFormat(period);
    const result: Record<string, number> = {};

    data.forEach(item => {
      const dateKey = format(new Date(item.date), periodFormat);
      result[dateKey] = (result[dateKey] || 0) + item.count;
    });

    return result;

    
  }*/

  private groupByTimePeriod(
    payments: {
      date: string | Date;
      amount: number;
      convertionRateToCabinet: number;
    }[],
    period?: string,
  ): Record<string, number> {
    const periodFormat = this.getPeriodFormat(period);
    const result: Record<string, number> = {};

    payments.forEach((payment) => {
      const dateKey = format(new Date(payment.date), periodFormat);
      result[dateKey] =
        (result[dateKey] || 0) +
        payment.amount * payment.convertionRateToCabinet;
    });

    return result;
  }
  private getPeriodFormat(period?: string): string {
    const formatMap = {
      '7days': 'yyyy-MM-dd',
      '30days': 'yyyy-MM-dd',
      '3months': 'yyyy-MM',
      default: 'yyyy-MM-dd',
    };

    return formatMap[period] || formatMap.default;
  }
  private buildDateFilter(period?: string): any {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        return MoreThanOrEqual(startDate);
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        return MoreThanOrEqual(startDate);
      case '3months':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        return MoreThanOrEqual(startDate);
      default: // 'all' ou non spécifié
        return undefined; // Pas de filtre de date
    }
  }

  //---------------------User Stats

  async getUserStats(userId: number) {
    const logs = await this.loggerService.findAll({
      filter: `userId||$eq||${userId}`,
    });

    // ------------------ Related Entities ------------------
    const relatedQuotations = _.uniqBy(
      logs.filter((l) => l.logInfo?.quotationId),
      (l) => l.logInfo.quotationId,
    ).length;

    const relatedInvoices = _.uniqBy(
      logs.filter((l) => l.logInfo?.invoiceId),
      (l) => l.logInfo.invoiceId,
    ).length;

    const relatedPayments = _.uniqBy(
      logs.filter((l) => l.logInfo?.paymentId),
      (l) => l.logInfo.paymentId,
    ).length;

    // ------------------ Time Stats ------------------
    const now = new Date();
    const thisWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const thisMonth = startOfMonth(now);

    const totalActions = logs.length;

    const monthlyActions = logs.filter((l) =>
      isAfter(l.loggedAt, thisMonth),
    ).length;

    const weeklyActions = logs.filter((l) =>
      isAfter(l.loggedAt, thisWeek),
    ).length;

    //error
    const peakHours = _(logs)
      .groupBy((log) => getHours(log.loggedAt))
      .map((logs, hour) => ({
        hour: parseInt(hour),
        count: logs.length,
      }))
      .orderBy('count', 'desc')
      .take(3)
      .value();

    // ------------------ Total System Actions ------------------
    const totalSystemActions = await this.loggerService.getTotal();

    // ------------------ Categories ------------------
    const countByPrefix = (prefix: string) =>
      logs.filter((l) => l.event?.startsWith(prefix)).length;

    const firmActions = countByPrefix('firm');
    const interlocutorActions = countByPrefix('interlocutor_');
    const sellingActions = countByPrefix('selling_');
    const buyingActions = countByPrefix('buying_');
    const systemActions = logs.filter((l) =>
      [
        'bank_account_',
        'activity_',
        'default_condition_',
        'default_conditions_',
        'payment_condition_',
        'tax_withholding_',
        'tax_',
      ].some((prefix) => l.event?.startsWith(prefix)),
    ).length;

    const adminstrativeActions = logs.filter((l) =>
      ['user_', 'role_'].some((prefix) => l.event?.startsWith(prefix)),
    ).length;

    // ------------------ Return ------------------
    return {
      relatedQuotations,
      relatedInvoices,
      relatedPayments,

      totalActions,
      monthlyActions,
      weeklyActions,
      peakHours,

      totalSystemActions,

      firmActions,
      interlocutorActions,
      sellingActions,
      buyingActions,
      systemActions,
      adminstrativeActions,
    };
  }
}
