import { forwardRef, Module } from '@nestjs/common';
import { InterlocutorService } from './services/interlocutor.service';
import { InterlocutorRepositoryModule } from './repositories/interlocutor.repository.module';
import { FirmInterlocutorEntryModule } from '../firm-interlocutor-entry/firm-interlocutor-entry.module';
import { FirmModule } from '../firm/firm.module';
import { SellingInvoiceModule } from '../invoice/selling-invoice/selling-invoice.module';
import { SellingQuotationModule } from '../quotation/selling-quotation/selling-quotation.module';
import { BuyingInvoiceModule } from '../invoice/buying-invoice/buying-invoice.module';
import { BuyingQuotationModule } from '../quotation/buying-quotation/buying-quotation.module';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [InterlocutorService],
  exports: [InterlocutorService],
  imports: [
    InterlocutorRepositoryModule,
    forwardRef(()=>FirmInterlocutorEntryModule),
    forwardRef(() => FirmModule),
    forwardRef(() => SellingInvoiceModule),
    forwardRef(() => SellingQuotationModule),
    forwardRef(() => BuyingInvoiceModule),
    forwardRef(() => BuyingQuotationModule),
    PermissionModule,
    UsersModule
  ],
})
export class InterlocutorModule {}
