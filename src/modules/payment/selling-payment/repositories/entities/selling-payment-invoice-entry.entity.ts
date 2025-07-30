import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SellingPaymentEntity } from 'src/modules/payment/selling-payment/repositories/entities/selling-payment.entity';
import { SellingInvoiceEntity } from 'src/modules/invoice/selling-invoice/repositories/entities/selling-invoice.entity';

@Entity('selling-payment-invoice-entry')
export class SellingPaymentInvoiceEntryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SellingPaymentEntity)
  @JoinColumn({ name: 'paymentId' })
  payment: SellingPaymentEntity;

  @Column({ type: 'int' })
  paymentId: number;

  @ManyToOne(() => SellingInvoiceEntity)
  @JoinColumn({ name: 'invoiceId' })
  invoice: SellingInvoiceEntity;

  @Column({ type: 'int' })
  invoiceId: number;

  @Column({ type: 'float', nullable: true })
  convertionRate: number;


  @Column({ type: 'float', nullable: true })
  amount: number;
}
