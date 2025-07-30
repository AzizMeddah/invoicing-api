import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  SellingQuotationUploadEntity } from '../entities/selling-quotation-file.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class SellingQuotationUploadRepository extends DatabaseAbstractRepository<SellingQuotationUploadEntity> {
  constructor(
    @InjectRepository(SellingQuotationUploadEntity)
    private readonly quotationUploadRespository: Repository<SellingQuotationUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(quotationUploadRespository, txHost);
  }
}
