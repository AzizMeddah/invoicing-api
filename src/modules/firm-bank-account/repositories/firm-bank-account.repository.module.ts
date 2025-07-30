import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmBankAccountRepository } from './repository/firm-bank-account.repository';
import { FirmBankAccountEntity } from './entities/firm-bank-account.entity';
@Module({
  controllers: [],
  providers: [FirmBankAccountRepository],
  exports: [FirmBankAccountRepository],
  imports: [TypeOrmModule.forFeature([FirmBankAccountEntity])],
})
export class FirmBankAccountRepositoryModule {}
