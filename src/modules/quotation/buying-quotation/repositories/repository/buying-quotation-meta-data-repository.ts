import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyingQuotationMetaDataEntity} from '../entities/buying-quotation-meta-data.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class BuyingQuotationMetaDataRepository extends DatabaseAbstractRepository<BuyingQuotationMetaDataEntity> {
  constructor(
    @InjectRepository(BuyingQuotationMetaDataEntity)
    private readonly quotationMetaDataRespository: Repository<BuyingQuotationMetaDataEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(quotationMetaDataRespository, txHost);
  }
}
