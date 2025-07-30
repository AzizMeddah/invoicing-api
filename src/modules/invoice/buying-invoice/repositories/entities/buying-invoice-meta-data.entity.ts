import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BuyingInvoiceEntity } from './buying-invoice.entity';

@Entity('buying-invoice-meta-data')
export class BuyingInvoiceMetaDataEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => BuyingInvoiceEntity, (invoice) => invoice.invoiceMetaData)
  invoice: BuyingInvoiceEntity;

  @Column({ type: 'boolean', default: true })

  @Column({ type: 'boolean', default: true })

  @Column({ type: 'boolean', default: true })
  showArticleDescription: boolean;

  @Column({ type: 'boolean', default: true })
  hasBankingDetails: boolean;

  @Column({ type: 'boolean', default: true })
  hasGeneralConditions: boolean;

  @Column({ type: 'boolean', default: true })
  hasTaxStamp: boolean;

  @Column({ type: 'boolean', default: true })
  hasTaxWithholding: boolean;

  @Column({ type: 'json', nullable: true })
  taxSummary: any;
}
