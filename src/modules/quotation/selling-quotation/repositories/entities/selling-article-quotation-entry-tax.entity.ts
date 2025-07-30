import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { SellingArticleQuotationEntryEntity } from './selling-article-quotation-entry.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';

@Entity('selling-article-quotation-entry-tax')
export class SellingArticleQuotationEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SellingArticleQuotationEntryEntity)
  @JoinColumn({ name: 'articleQuotationEntryId' })
  articleQuotationEntry: SellingArticleQuotationEntryEntity;

  @Column({ type: 'int' })
  articleQuotationEntryId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int' })
  taxId: number;
}
