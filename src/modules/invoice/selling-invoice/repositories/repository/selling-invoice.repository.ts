import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { SellingInvoiceEntity } from '../entities/selling-invoice.entity';

@Injectable()
export class SellingInvoiceRepository extends DatabaseAbstractRepository<SellingInvoiceEntity> {
  constructor(
    @InjectRepository(SellingInvoiceEntity)
    private readonly sellingInvoiceRepository: Repository<SellingInvoiceEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(sellingInvoiceRepository, txHost);
  }
  async findOneBySequential(sequential: string) {
    const sellinginvoice = await this.sellingInvoiceRepository.findOne({
      where: { sequential }
    });

    return sellinginvoice;
  }
}
