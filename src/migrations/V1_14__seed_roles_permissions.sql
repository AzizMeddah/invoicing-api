INSERT INTO `permission` (`label`, `description`) VALUES

('create_role', 'Permission to create roles'),
('read_role', 'Permission to view roles'),
('update_role', 'Permission to update roles'),
('delete_role', 'Permission to delete roles'),
('assign_role', 'Permission to assign roles to users'),
('unassign_role', 'Permission to remove roles from users'),

('create_permission', 'Permission to create permissions'),
('read_permission', 'Permission to view permissions'),
('update_permission', 'Permission to update permissions'),
('delete_permission', 'Permission to delete permissions'),
('assign_permission', 'Permission to assign permissions to roles'),
('unassign_permission', 'Permission to remove permissions from roles'),

('create_user', 'Permission to create users'),
('read_user', 'Permission to view user details'),
('update_user', 'Permission to update users'),
('delete_user', 'Permission to delete users'),

('create_activity', 'Permission to create activity'),
('read_activity', 'Permission to view activity details'),
('update_activity', 'Permission to update activity'),
('delete_activity', 'Permission to delete activity'),

('create_bank_account', 'Permission to create bank account'),
('read_bank_account', 'Permission to view bank account details'),
('update_bank_account', 'Permission to update bank account'),
('delete_bank_account', 'Permission to delete bank account'),

('create_default_condition', 'Permission to create default_condition'),
('read_default_condition', 'Permission to view default_condition details'),
('update_default_condition', 'Permission to update default_condition'),
('delete_default_condition', 'Permission to delete default_condition'),

('create_payment_condition', 'Permission to create payment_condition'),
('read_payment_condition', 'Permission to view payment_condition details'),
('update_payment_condition', 'Permission to update payment_condition'),
('delete_payment_condition', 'Permission to delete payment_condition'),

('create_tax_withholding', 'Permission to create tax_withholding'),
('read_tax_withholding', 'Permission to view tax_withholding details'),
('update_tax_withholding', 'Permission to update tax_withholding'),
('delete_tax_withholding', 'Permission to delete tax_withholding'),

('create_tax', 'Permission to create tax'),
('read_tax', 'Permission to view tax details'),
('update_tax', 'Permission to update tax'),
('delete_tax', 'Permission to delete tax'),

('create_sequential', 'Permission to create sequential'),
('read_sequential', 'Permission to view sequential details'),
('update_sequential', 'Permission to update sequential'),
('delete_sequential', 'Permission to delete sequential'),

('create_firm', 'Permission to create firm'),
('read_firm', 'Permission to view firm details'),
('update_firm', 'Permission to update firm'),
('delete_firm', 'Permission to delete firm'),

('create_interlocutor', 'Permission to create interlocutor'),
('read_interlocutor', 'Permission to view interlocutor details'),
('update_interlocutor', 'Permission to update interlocutor'),
('delete_interlocutor', 'Permission to delete interlocutor'),

('create_selling_quotation', 'Permission to create selling_quotation'),
('read_selling_quotation', 'Permission to view selling_quotation details'),
('update_selling_quotation', 'Permission to update selling_quotation'),
('delete_selling_quotation', 'Permission to delete selling_quotation'),

('create_selling_invoice', 'Permission to create selling_invoice'),
('read_selling_invoice', 'Permission to view selling_invoice details'),
('update_selling_invoice', 'Permission to update selling_invoice'),
('delete_selling_invoice', 'Permission to delete selling_invoice'),

('create_selling_payment', 'Permission to create selling_payment'),
('read_selling_payment', 'Permission to view selling_payment details'),
('update_selling_payment', 'Permission to update selling_payment'),
('delete_selling_payment', 'Permission to delete selling_payment'),

('create_buying_quotation', 'Permission to create buying_quotation'),
('read_buying_quotation', 'Permission to view buying_quotation details'),
('update_buying_quotation', 'Permission to update buying_quotation'),
('delete_buying_quotation', 'Permission to delete buying_quotation'),

('create_buying_invoice', 'Permission to create buying_invoice'),
('read_buying_invoice', 'Permission to view buying_invoice details'),
('update_buying_invoice', 'Permission to update buying_invoice'),
('delete_buying_invoice', 'Permission to delete buying_invoice'),

('create_buying_payment', 'Permission to create buying_payment'),
('read_buying_payment', 'Permission to view buying_payment details'),
('update_buying_payment', 'Permission to update buying_payment'),
('delete_buying_payment', 'Permission to delete buying_payment'),

('create_firm_bank_account', 'Permission to create firm bank account'),
('read_firm_bank_account', 'Permission to view bank firm account details'),
('update_firm_bank_account', 'Permission to update firm bank account'),
('delete_firm_bank_account', 'Permission to delete firm bank account');

-- 1. Insert the "Super Admin" Role
INSERT INTO `role` (`label`, `description`, `isDeletionRestricted`) 
VALUES ('Super Admin', 'Has all possible permissions', 1);

-- 2. Retrieve the ID of the "Super Admin" Role
SET @super_admin_role_id = (SELECT `id` FROM `role` WHERE `label` = 'Super Admin');

-- 3. Assign All Permissions to the "Super Admin" Role
INSERT INTO `role_permission` (`roleId`, `permissionId`, `isDeletionRestricted`)
SELECT @super_admin_role_id AS `roleId`, `id` AS `permissionId`, 1 AS `isDeletionRestricted`
FROM `permission`;

-- 4. Verify the Assignments (Optional)
SELECT rp.`roleId`, rp.`permissionId`, r.`label` AS `role`, p.`label` AS `permission`
FROM `role_permission` rp
JOIN `role` r ON rp.`roleId` = r.`id`
JOIN `permission` p ON rp.`permissionId` = p.`id`
WHERE r.`label` = 'Super Admin';




