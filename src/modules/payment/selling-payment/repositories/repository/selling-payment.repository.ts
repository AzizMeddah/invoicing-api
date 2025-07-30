import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingPaymentEntity } from '../entities/selling-payment.entity';

@Injectable()
export class SellingPaymentRepository extends DatabaseAbstractRepository<SellingPaymentEntity> {
  constructor(
    @InjectRepository(SellingPaymentEntity)
    private readonly sellingPaymentRepository: Repository<SellingPaymentEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(sellingPaymentRepository, txHost);
  }
  async getTotal(dateFilter?: any,firmId?:number): Promise<number> {
    const query = this.sellingPaymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount * payment.convertionRateToCabinet)', 'total')
      .where('payment.deletedAt IS NULL');
  
    if (dateFilter) {
      query.andWhere({ date: dateFilter });
    }
    if (firmId) {
      query.andWhere({ firmId });
    }

  
    const result = await query.getRawOne();
    return result?.total ? parseFloat(result.total) : 0;
  }
}
