import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingQuotationEntity } from '../entities/selling-quotation.entity';

@Injectable()
export class SellingQuotationRepository extends DatabaseAbstractRepository<SellingQuotationEntity> {
  constructor(
    @InjectRepository(SellingQuotationEntity)
    private readonly sellingQuotationRepository: Repository<SellingQuotationEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(sellingQuotationRepository, txHost);
  }
  async findOneBySequential(sequential: string) {
    const sellingquotation = await this.sellingQuotationRepository.findOne({
      where: { sequential }
    });

    return sellingquotation;
  }
}
