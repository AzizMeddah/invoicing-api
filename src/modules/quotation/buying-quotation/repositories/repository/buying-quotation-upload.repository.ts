import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyingQuotationUploadEntity} from '../entities/buying-quotation-file.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class BuyingQuotationUploadRepository extends DatabaseAbstractRepository<BuyingQuotationUploadEntity> {
  constructor(
    @InjectRepository(BuyingQuotationUploadEntity)
    private readonly quotationUploadRespository: Repository<BuyingQuotationUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(quotationUploadRespository, txHost);
  }
}
