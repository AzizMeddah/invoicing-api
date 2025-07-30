import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { BuyingPaymentEntity } from '../entities/buying-payment.entity';

@Injectable()
export class BuyingPaymentRepository extends DatabaseAbstractRepository<BuyingPaymentEntity> {
  constructor(
    @InjectRepository(BuyingPaymentEntity)
    private readonly buyingPaymentRepository: Repository<BuyingPaymentEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(buyingPaymentRepository, txHost);
  }
  async getTotal(dateFilter?: any,firmId?:number): Promise<number> {
    const query = this.buyingPaymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount * payment.convertionRateToCabinet)', 'total')
      .where('payment.deletedAt IS NULL');
  
    if (dateFilter) {
      query.andWhere({ date: dateFilter });
    }

    if (firmId) {
      query.andWhere({ firmId:firmId });
    }
  
    const result = await query.getRawOne();
    return result?.total ? parseFloat(result.total) : 0;
  }
}
