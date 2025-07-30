import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  SellingQuotationMetaDataEntity } from '../entities/selling-quotation-meta-data.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class SellingQuotationMetaDataRepository extends DatabaseAbstractRepository<SellingQuotationMetaDataEntity> {
  constructor(
    @InjectRepository(SellingQuotationMetaDataEntity)
    private readonly quotationMetaDataRespository: Repository<SellingQuotationMetaDataEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(quotationMetaDataRespository, txHost);
  }
}
