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
import { SellingArticleQuotationEntryTaxEntity } from './selling-article-quotation-entry-tax.entity';
import { SellingQuotationEntity } from './selling-quotation.entity';

@Entity('selling-article-quotation-entry')
export class SellingArticleQuotationEntryEntity extends EntityHelper {
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

  @ManyToOne(() => SellingQuotationEntity)
  @JoinColumn({ name: 'quotationId' })
  quotation: SellingQuotationEntity;

  @Column({ type: 'int', nullable: true })
  quotationId: number;

  @OneToMany(
    () => SellingArticleQuotationEntryTaxEntity,
    (articleQuotationEntryTax) =>
      articleQuotationEntryTax.articleQuotationEntry,
  )
  articleQuotationEntryTaxes: SellingArticleQuotationEntryTaxEntity[];
}
