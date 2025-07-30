import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { ArticleEntity } from 'src/modules/article/repositories/entities/article.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {  BuyingArticleInvoiceEntryTaxEntity } from './buying-article-invoice-entry-tax.entity';
import { BuyingInvoiceEntity } from './buying-invoice.entity';

@Entity('buying-article-invoice-entry')
export class BuyingArticleInvoiceEntryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  unit_price: number;

  @Column({ type: 'float', nullable: true })
  quantity: number;

  @Column({ type: 'float', nullable: true })
  discount: number;

  @Column({ type: 'enum', enum: DISCOUNT_TYPES, nullable: true })
  discount_type: DISCOUNT_TYPES;

  @Column({ type: 'float', nullable: true })
  subTotal: number;

  @Column({ type: 'float', nullable: true })
  total: number;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'articleId' })
  article: ArticleEntity;

  @Column({ type: 'int', nullable: true })
  articleId: number;

  @ManyToOne(() => BuyingInvoiceEntity)
  @JoinColumn({ name: 'invoiceId' })
  invoice: BuyingInvoiceEntity;

  @Column({ type: 'int', nullable: true })
  invoiceId: number;

  @OneToMany(
    () => BuyingArticleInvoiceEntryTaxEntity,
    (articleInvoiceEntryTax) => articleInvoiceEntryTax.articleInvoiceEntry,
  )
  articleInvoiceEntryTaxes: BuyingArticleInvoiceEntryTaxEntity[];
}
