import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SellingQuotationEntity } from './selling-quotation.entity';

@Entity('selling-quotation-meta-data')
export class SellingQuotationMetaDataEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => SellingQuotationEntity, (quotation) => quotation.quotationMetaData)
  quotation: SellingQuotationEntity;

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

  @Column({ type: 'json', nullable: true })
  taxSummary: any;
}
