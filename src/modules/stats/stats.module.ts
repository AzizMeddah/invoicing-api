import { Module } from '@nestjs/common';
import { StatsController } from './controllers/stats.controller';
import { StatsService } from './services/stats.service';
import { FirmModule } from '../firm/firm.module';
import { BuyingInvoiceModule } from '../invoice/buying-invoice/buying-invoice.module';
import { SellingInvoiceModule } from '../invoice/selling-invoice/selling-invoice.module';
import { BuyingPaymentModule } from '../payment/buying-payment/buying-payment.module';
import { SellingPaymentModule } from '../payment/selling-payment/selling-payment.module';
import { BuyingQuotationModule } from '../quotation/buying-quotation/buying-quotation.module';
import { SellingQuotationModule } from '../quotation/selling-quotation/selling-quotation.module';
import { CurrencyModule } from '../currency/currency.module';
import { PermissionModule } from '../permission/permission.module';
import { LoggerModule } from 'src/common/logger/logger.module';
@Module({
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
  imports: [
    BuyingQuotationModule,
    SellingQuotationModule,
    CurrencyModule,
    BuyingInvoiceModule,
    SellingInvoiceModule,
    BuyingPaymentModule,
    SellingPaymentModule,
    FirmModule,
    PermissionModule,
    LoggerModule
  ],
})
export class StatsModule {}
