import { DISCOUNT_TYPES } from "src/app/enums/discount-types.enum";
import { EntityHelper } from "src/common/database/interfaces/database.entity.interface";
import { BankAccountEntity } from "src/modules/bank-account/repositories/entities/bank-account.entity";
import { CabinetEntity } from "src/modules/cabinet/repositories/entities/cabinet.entity";
import { CurrencyEntity } from "src/modules/currency/repositories/entities/currency.entity";
import { FirmEntity } from "src/modules/firm/repositories/entities/firm.entity";
import { InterlocutorEntity } from "src/modules/interlocutor/repositories/entity/interlocutor.entity";
import { BuyingInvoiceEntity } from "src/modules/invoice/buying-invoice/repositories/entities/buying-invoice.entity";
import { BUYING_QUOTATION_STATUS } from "src/modules/quotation/buying-quotation/enums/buying-quotation-status.enum";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BuyingQuotationUploadEntity } from "./buying-quotation-file.entity";
import { BuyingQuotationMetaDataEntity } from "./buying-quotation-meta-data.entity";
import { BuyingArticleQuotationEntryEntity } from "./buying-article-quotation-entry.entity";
import { UploadEntity } from "src/common/storage/repositories/entities/upload.entity";
import { FirmBankAccountEntity } from "src/modules/firm-bank-account/repositories/entities/firm-bank-account.entity";


@Entity('buying-quotation')
export  class BuyingQuotationEntity extends EntityHelper {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25,nullable:true})
  sequential: string;

  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  object: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  generalConditions: string;

  @Column({ type: 'enum', enum: BUYING_QUOTATION_STATUS, nullable: true })
  status: BUYING_QUOTATION_STATUS;

  @Column({ nullable: true })
  discount: number;

  @Column({ type: 'enum', enum: DISCOUNT_TYPES, nullable: true })
  discount_type: DISCOUNT_TYPES;

  @Column({ type: 'float', nullable: true })
  subTotal: number;

  @Column({ type: 'float', nullable: true })
  total: number;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyId' })
  currency: CurrencyEntity;

  @Column({ type: 'int' })
  currencyId: number;

  @ManyToOne(() => FirmEntity)
  @JoinColumn({ name: 'firmId' })
  firm: FirmEntity;

  @Column({ type: 'int' })
  firmId: number;

  @ManyToOne(() => InterlocutorEntity)
  @JoinColumn({ name: 'interlocutorId' })
  interlocutor: InterlocutorEntity;

  @ManyToOne(() => CabinetEntity)
  @JoinColumn({ name: 'cabinetId' })
  cabinet: CabinetEntity;

  @Column({ type: 'int', default: 1 })
  cabinetId: number;

  @Column({ type: 'int' })
  interlocutorId: number;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  notes: string;

  @OneToMany(() => BuyingArticleQuotationEntryEntity, (entry) => entry.quotation)
  articleQuotationEntries: BuyingArticleQuotationEntryEntity[];

  @OneToOne(() => BuyingQuotationMetaDataEntity)
  @JoinColumn()
  quotationMetaData: BuyingQuotationMetaDataEntity;

  @ManyToOne(() => FirmBankAccountEntity)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: FirmBankAccountEntity;

  @Column({ type: 'int' })
  bankAccountId: number;

  @OneToMany(() => BuyingQuotationUploadEntity, (upload) => upload.quotation)
  uploads: BuyingQuotationUploadEntity[];

  @OneToMany(() => BuyingInvoiceEntity, (invoice) => invoice.quotation)
  invoices: BuyingInvoiceEntity[];

  @OneToOne(() =>UploadEntity)
  @JoinColumn({ name: 'referenceDocId' })
  referenceDoc: UploadEntity;

  @Column({ type: 'int' })
  referenceDocId: number;
}
