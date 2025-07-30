export enum EVENT_TYPE {
  //Auth
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',

  //Role
  ROLE_CREATED = 'role_created',
  ROLE_UPDATED = 'role_updated',
  ROLE_DELETED = 'role_deleted',
  ROLE_DUPLICATED = 'role_duplicated',

  //Firm
  FIRM_CREATED = 'firm_created',
  FIRM_UPDATED = 'firm_updated',
  FIRM_DELETED = 'firm_deleted',

  //interlocutor
  INTERLOCUTOR_CREATED = 'interlocutor_created',
  INTERLOCUTOR_UPDATED = 'interlocutor_updated',
  INTERLOCUTOR_DELETED = 'interlocutor_deleted',
  INTERLOCUTOR_PROMOTED = 'interlocutor_promoted',
  INTERLOCUTOR_ASSOCIATED = 'interlocutor_associated',
  INTERLOCUTOR_UNASSOCIATED = 'interlocutor_unassociated',

  //--------------------Selling----------------------------
  //Selling Quotation
  SELLING_QUOTATION_CREATED = 'selling_quotation_created',
  SELLING_QUOTATION_UPDATED = 'selling_quotation_updated',
  SELLING_QUOTATION_DELETED = 'selling_quotation_deleted',
  SELLING_QUOTATION_PRINTED = 'selling_quotation_printed',
  SELLING_QUOTATION_INVOICED = 'selling_quotation_invoiced',
  SELLING_QUOTATION_DUPLICATED = 'selling_quotation_duplicated',

  //Selling Invoice
  SELLING_INVOICE_CREATED = 'selling_invoice_created',
  SELLING_INVOICE_UPDATED = 'selling_invoice_updated',
  SELLING_INVOICE_DELETED = 'selling_invoice_deleted',
  SELLING_INVOICE_PRINTED = 'selling_invoice_printed',
  SELLING_INVOICE_DUPLICATED = 'selling_invoice_duplicated',

  //Selling Payment
  SELLING_PAYMENT_CREATED = 'selling_payment_created',
  SELLING_PAYMENT_UPDATED = 'selling_payment_updated',
  SELLING_PAYMENT_DELETED = 'selling_payment_deleted',
  SELLING_PAYMENT_PRINTED = 'selling_payment_printed',


  //--------------------Buying----------------------------
  //Buying Quotation
  BUYING_QUOTATION_UPDATED = 'buying_quotation_updated',
  BUYING_QUOTATION_CREATED = 'buying_quotation_created',
  BUYING_QUOTATION_DELETED = 'buying_quotation_deleted',
  BUYING_QUOTATION_PRINTED = 'buying_quotation_printed',
  BUYING_QUOTATION_INVOICED = 'buying_quotation_invoiced',
  BUYING_QUOTATION_DUPLICATED = 'buying_quotation_duplicated',

  //Buying Invoice
  BUYING_INVOICE_CREATED = 'buying_invoice_created',
  BUYING_INVOICE_UPDATED = 'buying_invoice_updated',
  BUYING_INVOICE_DELETED = 'buying_invoice_deleted',
  BUYING_INVOICE_PRINTED = 'buying_invoice_printed',
  BUYING_INVOICE_DUPLICATED = 'buying_invoice_duplicated',

  //Buying Payment
  BUYING_PAYMENT_CREATED = 'buying_payment_created',
  BUYING_PAYMENT_UPDATED = 'buying_payment_updated',
  BUYING_PAYMENT_DELETED = 'buying_payment_deleted',
  BUYING_PAYMENT_PRINTED = 'buying_payment_printed',


  //Content
  ACTIVITY_CREATED = 'activity_created',
  ACTIVITY_UPDATED = 'activity_updated',
  ACTIVITY_DELETED = 'activity_deleted',

  BANK_ACCOUNT_CREATED = 'bank_account_created',
  BANK_ACCOUNT_UPDATED = 'bank_account_updated',
  BANK_ACCOUNT_DELETED = 'bank_account_deleted',

  FIRM_BANK_ACCOUNT_CREATED = 'firm_bank_account_created',
  FIRM_BANK_ACCOUNT_UPDATED = 'firm_bank_account_updated',
  FIRM_BANK_ACCOUNT_DELETED = 'firm_bank_account_deleted',

  DEFAULT_CONDITION_CREATED = 'default_condition_created',
  DEFAULT_CONDITION_UPDATED = 'default_condition_updated',
  DEFAULT_CONDITION_MASS_UPDATED = 'default_conditions_updated',
  DEFAULT_CONDITION_DELETED = 'default_condition_deleted',

  PAYMENT_CONDITION_CREATED = 'payment_condition_created',
  PAYMENT_CONDITION_UPDATED = 'payment_condition_updated',
  PAYMENT_CONDITION_DELETED = 'payment_condition_deleted',

  TAX_WITHHOLDING_CREATED = 'tax_withholding_created',
  TAX_WITHHOLDING_UPDATED = 'tax_withholding_updated',
  TAX_WITHHOLDING_DELETED = 'tax_withholding_deleted',

  TAX_CREATED = 'tax_created',
  TAX_UPDATED = 'tax_updated',
  TAX_DELETED = 'tax_deleted',
}
