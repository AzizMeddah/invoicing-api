import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { FirmBankAccountEntity } from '../entities/firm-bank-account.entity';

@Injectable()
export class FirmBankAccountRepository extends DatabaseAbstractRepository<FirmBankAccountEntity> {
  constructor(
    @InjectRepository(FirmBankAccountEntity)
    private readonly bankAccountRepository: Repository<FirmBankAccountEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(bankAccountRepository, txHost);
  }
}
