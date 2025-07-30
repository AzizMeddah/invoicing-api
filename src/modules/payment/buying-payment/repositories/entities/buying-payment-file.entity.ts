import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { BuyingPaymentEntity } from './buying-payment.entity';

@Entity('buying-payment-upload')
export class BuyingPaymentUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BuyingPaymentEntity)
  @JoinColumn({ name: 'paymentId' })
  payment: BuyingPaymentEntity;

  @Column({ type: 'int' })
  paymentId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
