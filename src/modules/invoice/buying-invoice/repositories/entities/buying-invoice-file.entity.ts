import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { BuyingInvoiceEntity } from './buying-invoice.entity';

@Entity('buying-invoice-upload')
export class BuyingInvoiceUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BuyingInvoiceEntity)
  @JoinColumn({ name: 'invoiceId' })
  invoice: BuyingInvoiceEntity;

  @Column({ type: 'int' })
  invoiceId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
