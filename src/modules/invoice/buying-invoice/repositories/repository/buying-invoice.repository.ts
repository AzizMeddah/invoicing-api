import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { BuyingInvoiceEntity } from '../entities/buying-invoice.entity';

@Injectable()
export class BuyingInvoiceRepository extends DatabaseAbstractRepository<BuyingInvoiceEntity> {
  constructor(
    @InjectRepository(BuyingInvoiceEntity)
    private readonly buyingInvoiceRepository: Repository<BuyingInvoiceEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(buyingInvoiceRepository, txHost);
  }
  async findOneBySequential(sequential: string, firmId: number) {
    return await this.buyingInvoiceRepository.findOne({
      where: { sequential, firmId }
    });
  }

}
