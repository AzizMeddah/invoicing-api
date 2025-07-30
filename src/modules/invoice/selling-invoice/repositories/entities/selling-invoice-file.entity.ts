import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { SellingInvoiceEntity } from './selling-invoice.entity';

@Entity('selling-invoice-upload')
export class SellingInvoiceUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SellingInvoiceEntity)
  @JoinColumn({ name: 'invoiceId' })
  invoice: SellingInvoiceEntity;

  @Column({ type: 'int' })
  invoiceId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
