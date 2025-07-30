import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyingQuotationEntity } from '../entities/buying-quotation.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class BuyingQuotationRepository extends DatabaseAbstractRepository<BuyingQuotationEntity> {
  constructor(
    @InjectRepository(BuyingQuotationEntity)
    private readonly buyingQuotationRepository: Repository<BuyingQuotationEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(buyingQuotationRepository, txHost);
  }

  async findOneBySequential(sequential: string, firmId: number) {
    return await this.buyingQuotationRepository.findOne({
      where: {
        sequential,
        firm: { id: firmId },
        deletedAt: null
      }
    });
  }

}
