import { Module } from '@nestjs/common';
import { PaymentConditionService } from './services/payment-condition.service';
import { PaymentConditionRepositoryModule } from './repositories/payment-condition.repository.module';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [PaymentConditionService],
  exports: [PaymentConditionService],
  imports: [
    PaymentConditionRepositoryModule,
    PermissionModule,
    UsersModule
  ],
})
export class PaymentConditionModule {}
