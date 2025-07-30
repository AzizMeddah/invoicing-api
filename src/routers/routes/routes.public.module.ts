import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/common/app-config/app-config.module';
import { AppConfigController } from 'src/common/app-config/controllers/app-config.controller';
import { AuthModule } from 'src/common/auth/auth.module';
import { AuthController } from 'src/common/auth/controllers/auth.controller';
import { LoggerModule } from 'src/common/logger/logger.module';
import { StorageController } from 'src/common/storage/controllers/storage.controller';
import { StorageModule } from 'src/common/storage/storage.module';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { ActivityController } from 'src/modules/activity/controllers/activity.controller';
import { AddressModule } from 'src/modules/address/address.module';
import { AddressController } from 'src/modules/address/controllers/address.controller';
import { ArticleModule } from 'src/modules/article/article.module';
import { ArticleController } from 'src/modules/article/controllers/article.controller';
import { BankAccountModule } from 'src/modules/bank-account/bank-account.module';
import { BankAccountController } from 'src/modules/bank-account/controllers/bank-account.controller';
import { CabinetModule } from 'src/modules/cabinet/cabinet.module';
import { CabinetController } from 'src/modules/cabinet/controllers/cabinet.controller';
import { CountryController } from 'src/modules/country/controllers/country.controller';
import { CountryModule } from 'src/modules/country/country.module';
import { CurrencyController } from 'src/modules/currency/controllers/currency.controller';
import { CurrencyModule } from 'src/modules/currency/currency.module';
import { DefaultConditionController } from 'src/modules/default-condition/controllers/default-condition.controller';
import { DefaultConditionModule } from 'src/modules/default-condition/default-condition.module';
import { FirmBankAccountController } from 'src/modules/firm-bank-account/controllers/firm-bank-account.controller';
import { FirmBankAccountModule } from 'src/modules/firm-bank-account/firm-bank-account.module';
import { FirmInterlocutorEntryController } from 'src/modules/firm-interlocutor-entry/controllers/firm-interlocutor-entry.controller.ts';
import { FirmInterlocutorEntryModule } from 'src/modules/firm-interlocutor-entry/firm-interlocutor-entry.module';
import { FirmController } from 'src/modules/firm/controllers/firm.controller';
import { FirmModule } from 'src/modules/firm/firm.module';
import { InterlocutorModule } from 'src/modules/interlocutor/Interlocutor.module';
import { InterlocutorController } from 'src/modules/interlocutor/controllers/interlocutor.controller';
import { BuyingInvoiceModule } from 'src/modules/invoice/buying-invoice/buying-invoice.module';
import { BuyingInvoiceController } from 'src/modules/invoice/buying-invoice/controllers/buying-invoice.controller';
import { SellingInvoiceController } from 'src/modules/invoice/selling-invoice/controllers/selling-invoice.controller';
import { SellingInvoiceModule } from 'src/modules/invoice/selling-invoice/selling-invoice.module';
import { PaymentConditionController } from 'src/modules/payment-condition/controllers/payment-condition.controller';
import { PaymentConditionModule } from 'src/modules/payment-condition/payment-condition.module';
import { BuyingPaymentModule } from 'src/modules/payment/buying-payment/buying-payment.module';
import { BuyingPaymentController } from 'src/modules/payment/buying-payment/controllers/buying-payment.controller';
import { SellingPaymentController } from 'src/modules/payment/selling-payment/controllers/selling-payment.controller';
import { SellingPaymentModule } from 'src/modules/payment/selling-payment/selling-payment.module';
import { PermissionController } from 'src/modules/permission/controllers/permission.controller';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { BuyingQuotationModule } from 'src/modules/quotation/buying-quotation/buying-quotation.module';
import { BuyingQuotationController } from 'src/modules/quotation/buying-quotation/controllers/buying-quotation.controller';
import { SellingQuotationController } from 'src/modules/quotation/selling-quotation/controllers/selling-quotation.controller';
import { SellingQuotationModule } from 'src/modules/quotation/selling-quotation/selling-quotation.module';
import { RoleController } from 'src/modules/role/controllers/role.controller';
import { RoleModule } from 'src/modules/role/role.module';
import { StatsController } from 'src/modules/stats/controllers/stats.controller';
import { StatsModule } from 'src/modules/stats/stats.module';
import { TaxWithholdingController } from 'src/modules/tax-withholding/controllers/tax-withholding.controller';
import { TaxWithholdingModule } from 'src/modules/tax-withholding/tax-withholding.module';
import { TaxController } from 'src/modules/tax/controllers/tax.controller';
import { TaxModule } from 'src/modules/tax/tax.module';
import { UserController } from 'src/modules/user/controllers/user.controller';
import { UsersModule } from 'src/modules/user/user.module';

@Module({
  controllers: [
    AuthController,
    ActivityController,
    AddressController,
    ArticleController,
    AppConfigController,
    BankAccountController,
    FirmBankAccountController,
    CabinetController,
    CountryController,
    CurrencyController,
    DefaultConditionController,
    FirmController,
    FirmInterlocutorEntryController,
    InterlocutorController,
    SellingInvoiceController,
    BuyingInvoiceController,
    SellingPaymentController,
    BuyingPaymentController,
    PaymentConditionController,
    PermissionController,
    BuyingQuotationController,
    SellingQuotationController,
    RoleController,
    StorageController,
    TaxController,
    TaxWithholdingController,
    UserController,
    StatsController
  ],
  providers: [],
  exports: [],
  imports: [
    LoggerModule,
    AuthModule,
    ActivityModule,
    AddressModule,
    ArticleModule,
    AppConfigModule,
    BankAccountModule,
    FirmBankAccountModule,
    CabinetModule,
    CountryModule,
    CurrencyModule,
    DefaultConditionModule,
    FirmModule,
    FirmInterlocutorEntryModule,
    InterlocutorModule,
    SellingInvoiceModule,
    BuyingInvoiceModule,
    SellingPaymentModule,
    BuyingPaymentModule,
    PaymentConditionModule,
    
    SellingQuotationModule,
    BuyingQuotationModule,
    
    StatsModule,

    PermissionModule,
    RoleModule,
    StorageModule,
    TaxModule,
    TaxWithholdingModule,
    UsersModule,
  ],
})
export class RoutesPublicModule {}
