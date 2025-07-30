import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BuyingQuotationEntity } from './buying-quotation.entity';

@Entity('buying-quotation-meta-data')
export class BuyingQuotationMetaDataEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => BuyingQuotationEntity, (quotation) => quotation.quotationMetaData)
  quotation: BuyingQuotationEntity;

  @Column({ type: 'boolean', default: true })
  showArticleDescription: boolean;

  @Column({ type: 'boolean', default: true })
  hasBankingDetails: boolean;

  @Column({ type: 'boolean', default: true })
  hasGeneralConditions: boolean;

  @Column({ type: 'json', nullable: true })
  taxSummary: any;
}
