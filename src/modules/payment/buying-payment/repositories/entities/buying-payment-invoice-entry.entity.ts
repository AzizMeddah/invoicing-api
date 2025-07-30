import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BuyingPaymentEntity } from './buying-payment.entity';
import { BuyingInvoiceEntity } from 'src/modules/invoice/buying-invoice/repositories/entities/buying-invoice.entity';


@Entity('buying-payment-invoice-entry')
export class BuyingPaymentInvoiceEntryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BuyingPaymentEntity)
  @JoinColumn({ name: 'paymentId' })
  payment: BuyingPaymentEntity;

  @Column({ type: 'int' })
  paymentId: number;

  @ManyToOne(() => BuyingInvoiceEntity)
  @JoinColumn({ name: 'invoiceId' })
  invoice: BuyingInvoiceEntity;

  @Column({ type: 'int' })
  invoiceId: number;

  @Column({ type: 'float', nullable: true })
  convertionRate: number;

  @Column({ type: 'float', nullable: true })
  amount: number;
}
