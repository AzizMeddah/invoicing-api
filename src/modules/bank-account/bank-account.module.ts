import { Module } from '@nestjs/common';
import { BankAccountService } from './services/bank-account.service';
import { BankAccountRepositoryModule } from './repositories/bank-account.repository.module';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [BankAccountService],
  exports: [BankAccountService],
  imports: [
    BankAccountRepositoryModule,
    PermissionModule,
    UsersModule
  ],
})
export class BankAccountModule {}
