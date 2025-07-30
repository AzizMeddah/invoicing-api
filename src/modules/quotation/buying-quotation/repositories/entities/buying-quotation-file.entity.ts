import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { BuyingQuotationEntity } from './buying-quotation.entity';

@Entity('buying-quotation-upload')
export class BuyingQuotationUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BuyingQuotationEntity)
  @JoinColumn({ name: 'quotationId' })
  quotation: BuyingQuotationEntity;

  @Column({ type: 'int' })
  quotationId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
