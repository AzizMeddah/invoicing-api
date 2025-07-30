import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { SellingArticleInvoiceEntryEntity } from './selling-article-invoice-entry.entity';

@Entity('selling-article-invoice-entry-tax')
export class SellingArticleInvoiceEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SellingArticleInvoiceEntryEntity)
  @JoinColumn({ name: 'articleInvoiceEntryId' })
  articleInvoiceEntry: SellingArticleInvoiceEntryEntity;

  @Column({ type: 'int' })
  articleInvoiceEntryId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int' })
  taxId: number;
}
