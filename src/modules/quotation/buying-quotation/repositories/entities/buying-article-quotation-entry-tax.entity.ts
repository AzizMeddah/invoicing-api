import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { BuyingArticleQuotationEntryEntity } from './buying-article-quotation-entry.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';

@Entity('buying-article-quotation-entry-tax')
export class BuyingArticleQuotationEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BuyingArticleQuotationEntryEntity)
  @JoinColumn({ name: 'articleQuotationEntryId' })
  articleQuotationEntry: BuyingArticleQuotationEntryEntity;

  @Column({ type: 'int' })
  articleQuotationEntryId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int' })
  taxId: number;
}
