
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SellingPaymentInvoiceEntryEntity } from './selling-payment-invoice-entry.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { PAYMENT_MODE } from 'src/modules/payment/enums/payment-mode.enum';
import { CurrencyEntity } from 'src/modules/currency/repositories/entities/currency.entity';
import { SellingPaymentUploadEntity } from './selling-payment-file.entity';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';

@Entity('selling-payment')
export class SellingPaymentEntity extends EntityHelper{

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

  @OneToMany(() => SellingPaymentUploadEntity, (upload) => upload.payment)
  uploads: SellingPaymentUploadEntity[];



  @ManyToOne(() => FirmEntity)
  @JoinColumn({ name: 'firmId' })
  firm: FirmEntity;

  @Column({ type: 'int', nullable: true })
  firmId: number;

  @OneToMany(() => SellingPaymentInvoiceEntryEntity, (invoice) => invoice.payment)
  invoices: SellingPaymentInvoiceEntryEntity[];
}
