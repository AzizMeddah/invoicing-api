import { DISCOUNT_TYPES } from "src/app/enums/discount-types.enum";
import { EntityHelper } from "src/common/database/interfaces/database.entity.interface";
import { BankAccountEntity } from "src/modules/bank-account/repositories/entities/bank-account.entity";
import { CabinetEntity } from "src/modules/cabinet/repositories/entities/cabinet.entity";
import { CurrencyEntity } from "src/modules/currency/repositories/entities/currency.entity";
import { FirmEntity } from "src/modules/firm/repositories/entities/firm.entity";
import { InterlocutorEntity } from "src/modules/interlocutor/repositories/entity/interlocutor.entity";
import { SellingInvoiceEntity } from "src/modules/invoice/selling-invoice/repositories/entities/selling-invoice.entity";
import { SellingQuotationMetaDataEntity } from "src/modules/quotation/selling-quotation/repositories/entities/selling-quotation-meta-data.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import { SELLING_QUOTATION_STATUS } from "../../enums/selling-quotation-status.enum";
import { SellingArticleQuotationEntryEntity } from "./selling-article-quotation-entry.entity";
import { SellingQuotationUploadEntity } from "./selling-quotation-file.entity";

@Entity('selling-quotation')
export  class SellingQuotationEntity extends EntityHelper {

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

    @Column({ type: 'enum', enum: SELLING_QUOTATION_STATUS, nullable: true })
    status: SELLING_QUOTATION_STATUS;

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

    @OneToMany(() => SellingArticleQuotationEntryEntity, (entry) => entry.quotation)
    articleQuotationEntries: SellingArticleQuotationEntryEntity[];

    @OneToOne(() => SellingQuotationMetaDataEntity)
    @JoinColumn()
    quotationMetaData: SellingQuotationMetaDataEntity;

    @ManyToOne(() => BankAccountEntity)
    @JoinColumn({ name: 'bankAccountId' })
    bankAccount: BankAccountEntity;

    @Column({ type: 'int' })
    bankAccountId: number;

    @OneToMany(() => SellingQuotationUploadEntity, (upload) => upload.quotation)
    uploads: SellingQuotationUploadEntity[];
    
    @OneToMany(() => SellingInvoiceEntity, (invoice) => invoice.quotation)
    invoices: SellingInvoiceEntity[];
}
