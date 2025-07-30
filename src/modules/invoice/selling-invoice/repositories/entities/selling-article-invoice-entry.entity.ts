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
import { SellingArticleInvoiceEntryTaxEntity } from './selling-article-invoice-entry-tax.entity';
import { SellingInvoiceEntity } from './selling-invoice.entity';

@Entity('selling-article-invoice-entry')
export class SellingArticleInvoiceEntryEntity extends EntityHelper {
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

  @ManyToOne(() => SellingInvoiceEntity)
  @JoinColumn({ name: 'invoiceId' })
  invoice: SellingInvoiceEntity;

  @Column({ type: 'int', nullable: true })
  invoiceId: number;

  @OneToMany(
    () => SellingArticleInvoiceEntryTaxEntity,
    (articleInvoiceEntryTax) => articleInvoiceEntryTax.articleInvoiceEntry,
  )
  articleInvoiceEntryTaxes: SellingArticleInvoiceEntryTaxEntity[];
}
