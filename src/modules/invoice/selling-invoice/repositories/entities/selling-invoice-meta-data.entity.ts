import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SellingInvoiceEntity } from './selling-invoice.entity';

@Entity('selling-invoice-meta-data')
export class SellingInvoiceMetaDataEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => SellingInvoiceEntity, (invoice) => invoice.invoiceMetaData)
  invoice: SellingInvoiceEntity;

  @Column({ type: 'boolean', default: true })
  showInvoiceAddress: boolean;

  @Column({ type: 'boolean', default: true })
  showDeliveryAddress: boolean;

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
