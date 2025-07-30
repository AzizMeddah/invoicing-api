import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { BuyingArticleInvoiceEntryEntity } from './buying-article-invoice-entry.entity';

@Entity('buying-article-invoice-entry-tax')
export class BuyingArticleInvoiceEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BuyingArticleInvoiceEntryEntity)
  @JoinColumn({ name: 'articleInvoiceEntryId' })
  articleInvoiceEntry: BuyingArticleInvoiceEntryEntity;

  @Column({ type: 'int' })
  articleInvoiceEntryId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int' })
  taxId: number;
}
