import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SellingQuotationEntity } from 'src/modules/quotation/selling-quotation/repositories/entities/selling-quotation.entity';
import { SellingPaymentInvoiceEntryEntity } from 'src/modules/payment/selling-payment/repositories/entities/selling-payment-invoice-entry.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { CurrencyEntity } from 'src/modules/currency/repositories/entities/currency.entity';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';
import { BankAccountEntity } from 'src/modules/bank-account/repositories/entities/bank-account.entity';
import { CabinetEntity } from 'src/modules/cabinet/repositories/entities/cabinet.entity';
import { InterlocutorEntity } from 'src/modules/interlocutor/repositories/entity/interlocutor.entity';
import { TaxWithholdingEntity } from 'src/modules/tax-withholding/repositories/entities/tax-withholding.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { SELLING_INVOICE_STATUS } from '../../enums/selling-invoice-status.enum';
import { SellingInvoiceUploadEntity } from './selling-invoice-file.entity';
import { SellingInvoiceMetaDataEntity } from './selling-invoice-meta-data.entity';
import { SellingArticleInvoiceEntryEntity } from './selling-article-invoice-entry.entity';

@Entity('selling-invoice')
export  class SellingInvoiceEntity extends EntityHelper{

      @PrimaryGeneratedColumn()
      id: number;

      @Column({ type: 'varchar', length: 25, unique: true })
      sequential: string;

      @Column({ nullable: true })
      date: Date;

      @Column({ nullable: true })
      dueDate: Date;

      @Column({ type: 'varchar', length: 255, nullable: true })
      object: string;

      @Column({ type: 'varchar', length: 1024, nullable: true })
      generalConditions: string;

      @Column({ type: 'enum', enum: SELLING_INVOICE_STATUS, nullable: true })
      status: SELLING_INVOICE_STATUS;

      @Column({ nullable: true })
      discount: number;

      @Column({ type: 'enum', enum: DISCOUNT_TYPES, nullable: true })
      discount_type: DISCOUNT_TYPES;

      @Column({ type: 'float', nullable: true })
      subTotal: number;

      @Column({ type: 'float', nullable: true })
      total: number;

      @Column({ type: 'float', nullable: true })
      amountPaid: number;

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

      @OneToMany(() => SellingArticleInvoiceEntryEntity, (entry) => entry.invoice)
      articleInvoiceEntries: SellingArticleInvoiceEntryEntity[];

      @OneToOne(() => SellingInvoiceMetaDataEntity)
      @JoinColumn()
      invoiceMetaData: SellingInvoiceMetaDataEntity;

      @ManyToOne(() => BankAccountEntity)
      @JoinColumn({ name: 'bankAccountId' })
      bankAccount: BankAccountEntity;

      @Column({ type: 'int' })
      bankAccountId: number;

      @OneToMany(() => SellingInvoiceUploadEntity, (upload) => upload.invoice)
      uploads: SellingInvoiceUploadEntity[];

      @ManyToOne(() => TaxEntity)
      @JoinColumn({ name: 'taxStampId' })
      taxStamp: TaxEntity;

      @Column({ type: 'int' })
      taxStampId: number;

      @ManyToOne(() => TaxWithholdingEntity)
      @JoinColumn({ name: 'taxWithholdingId' })
      taxWithholding: TaxWithholdingEntity;

      @Column({ type: 'int', nullable: true })
      taxWithholdingId: number;

      @Column({ type: 'float', nullable: true })
      taxWithholdingAmount: number;

      @ManyToOne(() => SellingQuotationEntity)
      @JoinColumn({ name: 'quotationId' })
      quotation: SellingQuotationEntity;

      @Column({ type: 'int', nullable: true })
      quotationId: number;

      @OneToMany(() => SellingPaymentInvoiceEntryEntity, (entry) => entry.invoice)
      payments: SellingPaymentInvoiceEntryEntity[];
}
