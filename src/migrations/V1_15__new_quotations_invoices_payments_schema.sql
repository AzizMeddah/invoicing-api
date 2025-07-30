

ALTER TABLE `quotation` DROP FOREIGN KEY `FK_bank_account_quotation`;
ALTER TABLE `quotation` DROP FOREIGN KEY `FK_currency_quotation`;
ALTER TABLE `quotation` DROP FOREIGN KEY `FK_firm_quotation` ;
ALTER TABLE `quotation` DROP FOREIGN KEY `FK_interlocutor_quotation` ;
ALTER TABLE `quotation` DROP FOREIGN KEY `FK_cabinet_quotation` ;
ALTER TABLE `quotation` DROP FOREIGN KEY `FK_quotation_meta_data_quotation` ;

ALTER TABLE `invoice` DROP FOREIGN KEY `FK_invoice_quotation` ;


ALTER TABLE  `article-quotation-entry` DROP FOREIGN KEY `FK_article_article-quotation-entry` ;
ALTER TABLE  `article-quotation-entry` DROP FOREIGN KEY `FK_quotation_article-quotation-entry` ;

ALTER TABLE  `article-quotation-entry-tax` DROP FOREIGN KEY `FK_articleQuotationEntry_article-quotation-entry-tax` ;
ALTER TABLE  `article-quotation-entry-tax` DROP FOREIGN KEY `FK_tax_article-quotation-entry-tax`;


ALTER TABLE `quotation-upload` DROP FOREIGN KEY `FK_quotation_quotation-upload`;
ALTER TABLE `quotation-upload` DROP FOREIGN KEY `FK_upload_quotation-upload`;


DROP TABLE IF EXISTS `quotation`;
DROP TABLE IF EXISTS  `article-quotation-entry-tax`;
DROP TABLE IF EXISTS  `article-quotation-entry`;
DROP TABLE IF EXISTS  `quotation_meta_data`;
DROP TABLE IF EXISTS  `quotation-upload`;


CREATE TABLE
    IF NOT EXISTS `firm_bank_account` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(255) DEFAULT NULL,
        `bic` varchar(11) DEFAULT NULL,
        `rib` varchar(20) DEFAULT NULL,
        `iban` varchar(30) DEFAULT NULL,
        `currencyId` int DEFAULT NULL,
        `isMain` boolean DEFAULT TRUE,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        `firmId` int DEFAULT NULL,

        PRIMARY KEY (`id`),
        KEY `FK_firm_bank_account_firm` (`firmId`),
        KEY `FK_currency_firm_bank_account` (`currencyId`),
        CONSTRAINT `FK_firm_bank_account_firm` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_bank_account_currency` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE SET NULL
    );

    
CREATE TABLE
    IF NOT EXISTS `selling-quotation-meta-data` (
        `id` int NOT NULL AUTO_INCREMENT,
        `showInvoiceAddress` boolean DEFAULT TRUE,
        `showDeliveryAddress` boolean DEFAULT TRUE,
        `showArticleDescription` boolean DEFAULT TRUE,
        `hasBankingDetails` boolean DEFAULT TRUE,
        `hasGeneralConditions` boolean DEFAULT TRUE,
        `taxSummary` json DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE 
    IF NOT EXISTS `selling-quotation` (
        `id` int NOT NULL AUTO_INCREMENT,
        `sequential` varchar(25) NOT NULL UNIQUE,
        `date` datetime DEFAULT NULL,
        `dueDate` datetime DEFAULT NULL,
        `object` varchar(255) DEFAULT NULL,
        `generalConditions` varchar(1024) DEFAULT NULL,
        `status` enum (
            'quotation.status.non_existent',
            'quotation.status.expired',
            'quotation.status.draft',
            'quotation.status.validated',
            'quotation.status.sent',
            'quotation.status.accepted',
            'quotation.status.rejected',
            'quotation.status.invoiced',
            'quotation.status.archived'
        ) DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `cabinetId` int NOT NULL,
        `quotationMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        `bankAccountId` int DEFAULT NULL,

        PRIMARY KEY (`id`),
        KEY `FK_currency_selling-quotation` (`currencyId`),
        KEY `FK_firm_selling-quotation` (`firmId`),
        KEY `FK_interlocutor_selling-quotation` (`interlocutorId`),
        KEY `FK_cabinet_selling-quotation` (`cabinetId`),
        KEY `FK_selling-quotation-meta-data_selling-quotation` (`quotationMetaDataId`),
        CONSTRAINT `FK_currency_selling-quotation` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_selling-quotation` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_selling-quotation` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_selling-quotation` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_selling-quotation-meta-data_selling-quotation` FOREIGN KEY (`quotationMetaDataId`) REFERENCES `selling-quotation-meta-data` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_bank-account_selling-quotation` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL

    );


CREATE TABLE
    IF NOT EXISTS `selling-article-quotation-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `unit_price` float DEFAULT NULL,
        `quantity` float DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `articleId` int DEFAULT NULL,
        `quotationId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_article_selling-article-quotation-entry` (`articleId`),
        KEY `FK_selling-quotation_selling-article-quotation-entry` (`quotationId`),
        CONSTRAINT `FK_article_selling-article-quotation-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_selling-quotation_selling-article-quotation-entry` FOREIGN KEY (`quotationId`) REFERENCES `selling-quotation` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `selling-article-quotation-entry-tax` (
        `id` int NOT NULL AUTO_INCREMENT,
        `articleQuotationEntryId` int NOT NULL,
        `taxId` int NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_selling-article-quotation-entry_article-quotation-entry-tax` (`articleQuotationEntryId`),
        KEY `FK_tax_selling-article-quotation-entry-tax` (`taxId`),
        CONSTRAINT `FK_selling-article-quotation-entry_article-quotation-entry-tax` FOREIGN KEY (`articleQuotationEntryId`) REFERENCES `selling-article-quotation-entry` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_tax_selling-article-quotation-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `selling-quotation-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `quotationId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_selling-quotation_selling-quotation-upload` (`quotationId`),
        KEY `FK_upload_selling-quotation-upload` (`uploadId`),
        CONSTRAINT `FK_selling-quotation_selling-quotation-upload` FOREIGN KEY (`quotationId`) REFERENCES `selling-quotation` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_selling-quotation-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );


CREATE TABLE
    IF NOT EXISTS `buying-quotation-meta-data` (
        `id` int NOT NULL AUTO_INCREMENT,
        
        `showArticleDescription` boolean DEFAULT TRUE,
        `hasBankingDetails` boolean DEFAULT TRUE,
        `hasGeneralConditions` boolean DEFAULT TRUE,
        `taxSummary` json DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );


CREATE TABLE 
    IF NOT EXISTS `buying-quotation` (
        `id` int NOT NULL AUTO_INCREMENT,
        `sequential` varchar(25),
        `date` datetime DEFAULT NULL,
        `dueDate` datetime DEFAULT NULL,
        `object` varchar(255) DEFAULT NULL,
        `generalConditions` varchar(1024) DEFAULT NULL,
        `status` enum (
            'quotation.status.non_existent',
            'quotation.status.expired',
            'quotation.status.draft',
            'quotation.status.validated',
            'quotation.status.invoiced',
            'quotation.status.archived'
        ) DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `cabinetId` int NOT NULL,
        `quotationMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `referenceDocId` int,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        `bankAccountId` int DEFAULT NULL,


        PRIMARY KEY (`id`),
        KEY `FK_currency_buying-quotation` (`currencyId`),
        KEY `FK_firm_buying-quotation` (`firmId`),
        KEY `FK_interlocutor_buying-quotation` (`interlocutorId`),
        KEY `FK_cabinet_buying-quotation` (`cabinetId`),
        KEY `FK_buying-quotation-meta-data_buying-quotation` (`quotationMetaDataId`),
        CONSTRAINT `FK_currency_buying-quotation` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_buying-quotation` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_buying-quotation` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_buying-quotation` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_buying-quotation-meta-data_buying-quotation` FOREIGN KEY (`quotationMetaDataId`) REFERENCES `buying-quotation-meta-data` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_reference-doc-buying-quotation` FOREIGN KEY (`referenceDocId`) REFERENCES `upload` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_firm-bank-account_buying-quotation` FOREIGN KEY (`bankAccountId`) REFERENCES `firm_bank_account` (`id`) ON DELETE SET NULL
    );



CREATE TABLE
    IF NOT EXISTS `buying-article-quotation-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `unit_price` float DEFAULT NULL,
        `quantity` float DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `articleId` int DEFAULT NULL,
        `quotationId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_article_buying-article-quotation-entry` (`articleId`),
        KEY `FK_buying-quotation_buying-article-quotation-entry` (`quotationId`),
        CONSTRAINT `FK_article_buying-article-quotation-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_buying-quotation_buying-article-quotation-entry` FOREIGN KEY (`quotationId`) REFERENCES `buying-quotation` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `buying-article-quotation-entry-tax` (
        `id` int NOT NULL AUTO_INCREMENT,
        `articleQuotationEntryId` int NOT NULL,
        `taxId` int NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_buying-article-quotation-entry_article-quotation-entry-tax` (`articleQuotationEntryId`),
        KEY `FK_tax_buying-article-quotation-entry-tax` (`taxId`),
        CONSTRAINT `FK_buying-article-quotation-entry_article-quotation-entry-tax` FOREIGN KEY (`articleQuotationEntryId`) REFERENCES `buying-article-quotation-entry` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_tax_buying-article-quotation-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `buying-quotation-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `quotationId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_buying-quotation_buying-quotation-upload` (`quotationId`),
        KEY `FK_upload_buying-quotation-upload` (`uploadId`),
        CONSTRAINT `FK_buying-quotation_buying-quotation-upload` FOREIGN KEY (`quotationId`) REFERENCES `buying-quotation` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_buying-quotation-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );


ALTER TABLE `invoice` DROP FOREIGN KEY `FK_currency_invoice`;
ALTER TABLE `invoice` DROP FOREIGN KEY `FK_firm_invoice` ;
ALTER TABLE `invoice` DROP FOREIGN KEY `FK_interlocutor_invoice`;
ALTER TABLE `invoice` DROP FOREIGN KEY `FK_cabinet_invoice`;
ALTER TABLE `invoice` DROP FOREIGN KEY `FK_bank_account_invoice` ;
ALTER TABLE `invoice` DROP FOREIGN KEY `FK_invoice_meta_data_invoice`;
ALTER TABLE `invoice` DROP FOREIGN KEY `FK_invoice_tax` ;
ALTER TABLE `invoice` DROP FOREIGN KEY `FK_invoice_tax_withholding` ;

ALTER TABLE `payment-invoice_entry` DROP FOREIGN KEY`FK_invoice_payment-invoice` ;


ALTER TABLE `article-invoice-entry` DROP FOREIGN KEY `FK_article_article-invoice-entry`;
ALTER TABLE `article-invoice-entry` DROP FOREIGN KEY `FK_invoice_article-invoice-entry`;

ALTER TABLE `article-invoice-entry-tax` DROP FOREIGN KEY `FK_articleInvoiceEntry_article-invoice-entry-tax` ;
ALTER TABLE `article-invoice-entry-tax` DROP FOREIGN KEY `FK_tax_article-invoice-entry-tax`;

ALTER TABLE `invoice-upload` DROP FOREIGN KEY `FK_invoice_invoice-upload` ;
ALTER TABLE `invoice-upload` DROP FOREIGN KEY `FK_upload_invoice-upload` ;

DROP TABLE IF EXISTS `invoice`;
DROP TABLE IF EXISTS  `article-invoice-entry-tax`;
DROP TABLE IF EXISTS  `article-invoice-entry`;
DROP TABLE IF EXISTS  `invoice_meta_data`;
DROP TABLE IF EXISTS  `invoice-upload`;

CREATE TABLE
    IF NOT EXISTS `selling-invoice-meta-data` (
        `id` int NOT NULL AUTO_INCREMENT,
        `showInvoiceAddress` boolean DEFAULT TRUE,
        `showDeliveryAddress` boolean DEFAULT TRUE,
        `showArticleDescription` boolean DEFAULT TRUE,
        `hasBankingDetails` boolean DEFAULT TRUE,
        `hasGeneralConditions` boolean DEFAULT TRUE,
        `taxSummary` json DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        `hasTaxStamp` boolean DEFAULT FALSE,
        `hasTaxWithholding` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE 
    IF NOT EXISTS `selling-invoice` (
        `id` int NOT NULL AUTO_INCREMENT,
        `sequential` varchar(25) NOT NULL UNIQUE,
        `date` datetime DEFAULT NULL,
        `dueDate` datetime DEFAULT NULL,
        `object` varchar(255) DEFAULT NULL,
        `generalConditions` varchar(1024) DEFAULT NULL,
        `status` enum (
            'invoice.status.non_existent',
            'invoice.status.draft',
            'invoice.status.sent',
            'invoice.status.validated',
            'invoice.status.paid',
            'invoice.status.partially_paid',
            'invoice.status.unpaid',
            'invoice.status.expired',
            'invoice.status.archived'
        ) DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `cabinetId` int NOT NULL,
        `invoiceMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `bankAccountId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        `quotationId` INT NULL,
        `taxStampId` INT NULL,
        `amountPaid` float DEFAULT 0,
        `taxWithholdingAmount` FLOAT DEFAULT NULL,
        `taxWithholdingId` INT NULL,


        PRIMARY KEY (`id`),
        KEY `FK_selling_invoice_selling_quotation` (`quotationId`),
        KEY `FK_currency_selling-invoice` (`currencyId`),
        KEY `FK_firm_selling-invoice` (`firmId`),
        KEY `FK_interlocutor_selling-invoice` (`interlocutorId`),
        KEY `FK_cabinet_selling-invoice` (`cabinetId`),
        KEY `FK_selling-invoice-meta-data_invoice` (`invoiceMetaDataId`),
        KEY `FK_selling-invoice_tax`(`taxStampId`),
        KEY `FK_selling-invoice_tax_withholding` (`taxWithholdingId`),

        CONSTRAINT `FK_currency_selling-invoice` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_selling-invoice` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_selling-invoice` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_selling-invoice` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_bank_account_selling-invoice` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_selling-invoice_meta_data_selling-invoice` FOREIGN KEY (`invoiceMetaDataId`) REFERENCES `selling-invoice-meta-data` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_selling_invoice_selling_quotation` FOREIGN KEY (`quotationId`) REFERENCES `selling-quotation` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_selling-invoice_tax` FOREIGN KEY (`taxStampId`) REFERENCES `tax` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_selling-invoice_tax_withholding` FOREIGN KEY (`taxWithholdingId`) REFERENCES `tax-withholding` (`id`) ON DELETE SET NULL

    );

CREATE TABLE
    IF NOT EXISTS `selling-article-invoice-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `unit_price` float DEFAULT NULL,
        `quantity` float DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `articleId` int DEFAULT NULL,
        `invoiceId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_article_selling-article-invoice-entry` (`articleId`),
        KEY `FK_selling-invoice_selling-article-invoice-entry` (`invoiceId`),
        CONSTRAINT `FK_article_selling-article-invoice-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_selling-invoice_selling-article-invoice-entry` FOREIGN KEY (`invoiceId`) REFERENCES `selling-invoice` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `selling-article-invoice-entry-tax` (
        `id` int NOT NULL AUTO_INCREMENT,
        `articleInvoiceEntryId` int NOT NULL,
        `taxId` int NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_selling-article-invoice-entry_article-invoice-entry-tax` (`articleInvoiceEntryId`),
        KEY `FK_tax_selling-article-invoice-entry-tax` (`taxId`),
        CONSTRAINT `FK_selling-article-invoice-entry_article-invoice-entry-tax` FOREIGN KEY (`articleInvoiceEntryId`) REFERENCES `selling-article-invoice-entry` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_tax_selling-article-invoice-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `selling-invoice-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `invoiceId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_selling-invoice_selling-invoice-upload` (`invoiceId`),
        KEY `FK_upload_selling-invoice-upload` (`uploadId`),
        CONSTRAINT `FK_selling-invoice_selling-invoice-upload` FOREIGN KEY (`invoiceId`) REFERENCES `selling-invoice` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_selling-invoice-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `buying-invoice-meta-data` (
        `id` int NOT NULL AUTO_INCREMENT,
        `showArticleDescription` boolean DEFAULT TRUE,
        `hasBankingDetails` boolean DEFAULT TRUE,
        `hasGeneralConditions` boolean DEFAULT TRUE,
        `taxSummary` json DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        `hasTaxStamp` boolean DEFAULT FALSE,
        `hasTaxWithholding` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE 
    IF NOT EXISTS `buying-invoice` (
        `id` int NOT NULL AUTO_INCREMENT,
        `sequential` varchar(25),
        `date` datetime DEFAULT NULL,
        `dueDate` datetime DEFAULT NULL,
        `object` varchar(255) DEFAULT NULL,
        `generalConditions` varchar(1024) DEFAULT NULL,
        `status` enum (
            'invoice.status.non_existent',
            'invoice.status.draft',
            'invoice.status.validated',
            'invoice.status.paid',
            'invoice.status.partially_paid',
            'invoice.status.unpaid',
            'invoice.status.expired',
            'invoice.status.archived'
        ) DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `cabinetId` int NOT NULL,
        `invoiceMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `bankAccountId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        `referenceDocId` int,
        `quotationId` INT NULL,
        `taxStampId` INT NULL,
        `amountPaid` float DEFAULT 0,
        `taxWithholdingAmount` FLOAT DEFAULT NULL,
        `taxWithholdingId` INT NULL,



        PRIMARY KEY (`id`),
        KEY `FK_currency_buying-invoice` (`currencyId`),
        KEY `FK_firm_buying-invoice` (`firmId`),
        KEY `FK_interlocutor_buying-invoice` (`interlocutorId`),
        KEY `FK_cabinet_buying-invoice` (`cabinetId`),
        KEY `FK_buying-invoice_meta_data_buying-invoice` (`invoiceMetaDataId`),
        KEY `FK_reference_doc_buying_invoice` (`referenceDocId`),
        KEY `FK_buying_invoice_buying_quotation` (`quotationId`),
        KEY `FK_buying-invoice_tax` (`taxStampId`),
        KEY `FK_buying-invoice_tax_withholding` (`taxWithholdingId`),


        CONSTRAINT `FK_currency_buying-invoice` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_buying-invoice` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_buying-invoice` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_buying-invoice` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_bank_account_buying-invoice` FOREIGN KEY (`bankAccountId`) REFERENCES `firm_bank_account` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_buying-invoice_meta_data_buying-invoice` FOREIGN KEY (`invoiceMetaDataId`) REFERENCES `buying-invoice-meta-data` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_reference_doc_buying_invoice` FOREIGN KEY (`referenceDocId`) REFERENCES `upload` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_buying_invoice_buying_quotation` FOREIGN KEY (`quotationId`) REFERENCES `buying-quotation` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_buying-invoice_tax` FOREIGN KEY (`taxStampId`) REFERENCES `tax` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_buying-invoice_tax_withholding` FOREIGN KEY (`taxWithholdingId`) REFERENCES `tax-withholding` (`id`) ON DELETE SET NULL

    );

CREATE TABLE
    IF NOT EXISTS `buying-article-invoice-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `unit_price` float DEFAULT NULL,
        `quantity` float DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `articleId` int DEFAULT NULL,
        `invoiceId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,

        PRIMARY KEY (`id`),
        KEY `FK_article_buying-article-invoice-entry` (`articleId`),
        KEY `FK_buying-invoice_buying-article-invoice-entry` (`invoiceId`),
        
        CONSTRAINT `FK_article_buying-article-invoice-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_buying-invoice_buying-article-invoice-entry` FOREIGN KEY (`invoiceId`) REFERENCES `buying-invoice` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `buying-article-invoice-entry-tax` (
        `id` int NOT NULL AUTO_INCREMENT,
        `articleInvoiceEntryId` int NOT NULL,
        `taxId` int NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,

        PRIMARY KEY (`id`),
        KEY `FK_buying-article-invoice-entry_article-invoice-entry-tax` (`articleInvoiceEntryId`),
        KEY `FK_tax_buying-article-invoice-entry-tax` (`taxId`),
        
        CONSTRAINT `FK_buying-article-invoice-entry_article-invoice-entry-tax` FOREIGN KEY (`articleInvoiceEntryId`) REFERENCES `buying-article-invoice-entry` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_tax_buying-article-invoice-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `buying-invoice-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `invoiceId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,

        PRIMARY KEY (`id`),
        KEY `FK_buying-invoice_buying-invoice-upload` (`invoiceId`),
        KEY `FK_upload_buying-invoice-upload` (`uploadId`),
        
        CONSTRAINT `FK_buying-invoice_buying-invoice-upload` FOREIGN KEY (`invoiceId`) REFERENCES `buying-invoice` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_buying-invoice-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );



ALTER TABLE `payment` DROP FOREIGN KEY  `FK_firm_payment` ;
ALTER TABLE `payment` DROP FOREIGN KEY `FK_currency_payment`;

ALTER TABLE `payment-upload` DROP FOREIGN KEY`FK_payment_payment-upload` ;
ALTER TABLE `payment-upload` DROP FOREIGN KEY`FK_upload_payment-upload`;

ALTER TABLE `payment-invoice_entry` DROP FOREIGN KEY`FK_payment_payment-invoice` ;

DROP TABLE IF EXISTS `payment-invoice_entry`;
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `payment-upload`;



CREATE TABLE 
    IF NOT EXISTS `selling-payment`(
        `id` int NOT NULL AUTO_INCREMENT,
        `amount` float DEFAULT NULL,
        `fee` float DEFAULT NULL,
        `date` datetime DEFAULT NULL,
        `mode` enum (
            'credit_card',
            'cash',
            'check',
            'bank_transfer',
            'wire_transfer'
        ) DEFAULT NULL,
        `currencyId` int NOT NULL,
        `convertionRateToCabinet` float DEFAULT NULL,
        `firmId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_firm_selling-payment` (`firmId`),
        KEY `FK_currency_selling-payment` (`currencyId`),
        CONSTRAINT `FK_firm_selling-payment` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_currency_selling-payment` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE

    );

CREATE TABLE
    IF NOT EXISTS `selling-payment-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `paymentId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_selling-payment_selling-payment-upload` (`paymentId`),
        KEY `FK_upload_selling-payment-upload` (`uploadId`),
        CONSTRAINT `FK_selling-payment_selling-payment-upload` FOREIGN KEY (`paymentId`) REFERENCES `selling-payment` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_selling-payment-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `selling-payment-invoice-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `paymentId` int DEFAULT NULL,
        `invoiceId` int DEFAULT NULL,
        `amount` float DEFAULT NULL,
        `convertionRate` float DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_selling_payment_selling_payment-invoice` (`paymentId`),
        KEY `FK_selling_invoice_selling_payment-invoice` (`invoiceId`),
        CONSTRAINT `FK_selling_payment_selling_payment-invoice` FOREIGN KEY (`paymentId`) REFERENCES `selling-payment` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_selling_invoice_selling_payment-invoice` FOREIGN KEY (`invoiceId`) REFERENCES `selling-invoice` (`id`) ON DELETE CASCADE
    );

CREATE TABLE 
    IF NOT EXISTS `buying-payment` (
        `id` int NOT NULL AUTO_INCREMENT,
        `amount` float DEFAULT NULL,
        `fee` float DEFAULT NULL,
        `date` datetime DEFAULT NULL,
        `mode` enum (
            'credit_card',
            'cash',
            'check',
            'bank_transfer',
            'wire_transfer'
        ) DEFAULT NULL,
        `currencyId` int NOT NULL,
        `convertionRateToCabinet` float DEFAULT NULL,
        `firmId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_firm_buying-payment` (`firmId`),
        KEY `FK_currency_buying-payment` (`currencyId`),
        CONSTRAINT `FK_firm_buying-payment` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_currency_buying-payment` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE

    );
CREATE TABLE
    IF NOT EXISTS `buying-payment-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `paymentId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_buying-payment_buying-payment-upload` (`paymentId`),
        KEY `FK_upload_buying-payment-upload` (`uploadId`),
        CONSTRAINT `FK_buying-payment_buying-payment-upload` FOREIGN KEY (`paymentId`) REFERENCES `buying-payment` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_buying-payment-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `buying-payment-invoice-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `paymentId` int DEFAULT NULL,
        `invoiceId` int DEFAULT NULL,
        `amount` float DEFAULT NULL,
        `convertionRate` float DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_buying_payment_buying_payment-invoice` (`paymentId`),
        KEY `FK_buying_invoice_buying_payment-invoice` (`invoiceId`),
        CONSTRAINT `FK_buying_payment_buying_payment-invoice` FOREIGN KEY (`paymentId`) REFERENCES `buying-payment` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_buying_invoice_buying_payment-invoice` FOREIGN KEY (`invoiceId`) REFERENCES `buying-invoice` (`id`) ON DELETE CASCADE
    );

INSERT INTO `permission` (`label`, `description`) VALUES
    ('associate_interlocutor', 'Permission to associate interlocutors'),
    ('unassociate_interlocutor', 'Permission to unassociate interlocutors'),
    ('read_stats', 'Permission to read statistics'),
    ('read_loggs','Permission to read loggs'),
    ('read_cabinet','Permission to read cabinet'),
    ('update_cabinet','Permission to update cabinet');

INSERT INTO `role_permission` (`roleId`, `permissionId`, `isDeletionRestricted`) VALUES
    (1, 81, 1),
    (1, 82, 1),
    (1, 83, 1),
    (1, 84, 1),
    (1, 85, 1),
    (1, 86, 1);
DELETE FROM `role_permission` WHERE `permissionId` IN (5,6,7,9,10,11,12);
DELETE FROM `permission` WHERE `id` IN (5,6,7,9,10,11,12);

ALTER TABLE `user`
ADD COLUMN requirePasswordChange BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN resetToken VARCHAR(255) NULL,
ADD COLUMN resetTokenExpires TIMESTAMP NULL;