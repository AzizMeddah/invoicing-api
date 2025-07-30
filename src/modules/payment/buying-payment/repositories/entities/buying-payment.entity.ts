
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BuyingPaymentInvoiceEntryEntity } from './buying-payment-invoice-entry.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { PAYMENT_MODE } from 'src/modules/payment/enums/payment-mode.enum';
import { CurrencyEntity } from 'src/modules/currency/repositories/entities/currency.entity';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';
import { BuyingPaymentUploadEntity } from './buying-payment-file.entity';

@Entity('buying-payment')
export class BuyingPaymentEntity extends EntityHelper {


 @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ type: 'float', nullable: true })
  fee: number;



  @Column({ nullable: true })
  date: Date;

  @Column({ type: 'enum', enum: PAYMENT_MODE, nullable: true })
  mode: PAYMENT_MODE;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  notes: string;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyId' })
  currency: CurrencyEntity;

  @Column({ type: 'int', nullable: true })
  currencyId: number;

  @Column({ type: 'float', nullable: true })
  convertionRateToCabinet: number;

  @ManyToOne(() => FirmEntity)
  @JoinColumn({ name: 'firmId' })
  firm: FirmEntity;

  @Column({ type: 'int', nullable: true })
  firmId: number;

  @OneToMany(() => BuyingPaymentInvoiceEntryEntity, (invoice) => invoice.payment)
  invoices: BuyingPaymentInvoiceEntryEntity[];
  
  @OneToMany(() => BuyingPaymentUploadEntity, (upload) => upload.payment)
  uploads: BuyingPaymentUploadEntity[];
}
