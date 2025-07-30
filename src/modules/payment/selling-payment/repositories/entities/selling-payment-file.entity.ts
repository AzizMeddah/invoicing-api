import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { SellingPaymentEntity } from './selling-payment.entity';

@Entity('selling-payment-upload')
export class SellingPaymentUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SellingPaymentEntity)
  @JoinColumn({ name: 'paymentId' })
  payment: SellingPaymentEntity;

  @Column({ type: 'int' })
  paymentId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
