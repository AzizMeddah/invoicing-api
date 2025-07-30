import { Module } from '@nestjs/common';
import { FirmBankAccountRepositoryModule } from './repositories/firm-bank-account.repository.module';
import { FirmBankAccountService } from './services/firm-bank-account.service';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [FirmBankAccountService],
  exports: [FirmBankAccountService],
  imports: [
    FirmBankAccountRepositoryModule,
    PermissionModule,
    UsersModule
  ],
})
export class FirmBankAccountModule {}
