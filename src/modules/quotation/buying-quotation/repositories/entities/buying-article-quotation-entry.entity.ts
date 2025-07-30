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
import { BuyingArticleQuotationEntryTaxEntity } from './buying-article-quotation-entry-tax.entity';
import { BuyingQuotationEntity } from './buying-quotation.entity';

@Entity('buying-article-quotation-entry')
export class BuyingArticleQuotationEntryEntity extends EntityHelper {
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

  @ManyToOne(() => BuyingQuotationEntity)
  @JoinColumn({ name: 'quotationId' })
  quotation: BuyingQuotationEntity;

  @Column({ type: 'int', nullable: true })
  quotationId: number;

  @OneToMany(
    () => BuyingArticleQuotationEntryTaxEntity,
    (articleQuotationEntryTax) =>
      articleQuotationEntryTax.articleQuotationEntry,
  )
  articleQuotationEntryTaxes: BuyingArticleQuotationEntryTaxEntity[];
}
