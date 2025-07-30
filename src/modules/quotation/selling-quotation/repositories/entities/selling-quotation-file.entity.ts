import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { SellingQuotationEntity } from './selling-quotation.entity';

@Entity('selling-quotation-upload')
export class SellingQuotationUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SellingQuotationEntity)
  @JoinColumn({ name: 'quotationId' })
  quotation: SellingQuotationEntity;

  @Column({ type: 'int' })
  quotationId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
