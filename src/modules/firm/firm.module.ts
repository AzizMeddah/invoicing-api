import { forwardRef, Module } from '@nestjs/common';
import { FirmService } from './services/firm.service';
import { FirmRepositoryModule } from './repositories/firm.repository.module';
import { InterlocutorModule } from '../interlocutor/Interlocutor.module';
import { AddressModule } from '../address/address.module';
import { CurrencyModule } from '../currency/currency.module';
import { ActivityModule } from '../activity/activity.module';
import { PaymentConditionModule } from '../payment-condition/payment-condition.module';
import { FirmInterlocutorEntryModule } from '../firm-interlocutor-entry/firm-interlocutor-entry.module';
import { BuyingInvoiceModule } from '../invoice/buying-invoice/buying-invoice.module';
import { SellingInvoiceModule } from '../invoice/selling-invoice/selling-invoice.module';
import { SellingPaymentModule } from '../payment/selling-payment/selling-payment.module';
import { BuyingPaymentModule } from '../payment/buying-payment/buying-payment.module';
import { FirmBankAccountModule } from '../firm-bank-account/firm-bank-account.module';
import { BuyingQuotationModule } from '../quotation/buying-quotation/buying-quotation.module';
import { SellingQuotationModule } from '../quotation/selling-quotation/selling-quotation.module';
import { UsersModule } from '../user/user.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  controllers: [],
  providers: [FirmService],
  exports: [FirmService, FirmRepositoryModule],
  imports: [
    FirmRepositoryModule,
    ActivityModule,
    AddressModule,
    CurrencyModule,
    forwardRef(()=>InterlocutorModule),
    PaymentConditionModule,
    forwardRef(()=>FirmInterlocutorEntryModule),

    forwardRef(()=>BuyingInvoiceModule) ,
    forwardRef(()=>SellingInvoiceModule),

    forwardRef(()=>BuyingQuotationModule) ,
    forwardRef(()=>SellingQuotationModule) ,

    forwardRef(()=>BuyingPaymentModule) ,
    forwardRef(()=>SellingPaymentModule),
    FirmBankAccountModule,
    UsersModule,
    PermissionModule
  ],
})
export class FirmModule {}
