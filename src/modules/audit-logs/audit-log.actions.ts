export const AUDIT_ACTION = {
  // Organizations
  ORGANIZATION_CREATED: 'organization.created',
  ORGANIZATION_UPDATED: 'organization.updated',
  ORGANIZATION_DELETED: 'organization.deleted',

  // Memberships
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_UPDATED: 'member.role_updated',

  // Clients
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  CLIENT_DELETED: 'client.deleted',

  // Client contacts
  CLIENT_CONTACT_CREATED: 'client_contact.created',
  CLIENT_CONTACT_UPDATED: 'client_contact.updated',
  CLIENT_CONTACT_DELETED: 'client_contact.deleted',

  // Client addresses
  CLIENT_ADDRESS_CREATED: 'client_address.created',
  CLIENT_ADDRESS_UPDATED: 'client_address.updated',
  CLIENT_ADDRESS_DELETED: 'client_address.deleted',

  // Document categories
  DOCUMENT_CATEGORY_CREATED: 'document_category.created',
  DOCUMENT_CATEGORY_UPDATED: 'document_category.updated',
  DOCUMENT_CATEGORY_DELETED: 'document_category.deleted',

  // Documents
  DOCUMENT_CREATED: 'document.created',
  DOCUMENT_UPDATED: 'document.updated',
  DOCUMENT_DELETED: 'document.deleted',
  DOCUMENT_VERSION_UPLOADED: 'document.version_uploaded',
  DOCUMENT_DOWNLOADED: 'document.downloaded',

  // Operations
  OPERATION_CREATED: 'operation.created',
  OPERATION_UPDATED: 'operation.updated',
  OPERATION_DELETED: 'operation.deleted',
  OPERATION_ASSIGNED: 'operation.assigned',
  OPERATION_STATUS_CHANGED: 'operation.status_changed',
  OPERATION_COMMENT_ADDED: 'operation.comment_added',

  // Finance — charges
  FINANCE_CHARGE_CREATED: 'finance.charge_created',
  FINANCE_CHARGE_UPDATED: 'finance.charge_updated',
  FINANCE_CHARGE_DELETED: 'finance.charge_deleted',

  // Finance — advances
  FINANCE_ADVANCE_CREATED: 'finance.advance_created',
  FINANCE_ADVANCE_UPDATED: 'finance.advance_updated',
  FINANCE_ADVANCE_DELETED: 'finance.advance_deleted',

  // Finance — expense account
  FINANCE_EXPENSE_ACCOUNT_GENERATED: 'finance.expense_account_generated',

  // Compliance — rule sets
  COMPLIANCE_RULE_SET_CREATED: 'compliance.rule_set_created',
  COMPLIANCE_RULE_SET_UPDATED: 'compliance.rule_set_updated',
  COMPLIANCE_RULE_SET_DELETED: 'compliance.rule_set_deleted',

  // Compliance — document requirements
  COMPLIANCE_DOCUMENT_REQUIREMENT_CREATED:
    'compliance.document_requirement_created',
  COMPLIANCE_DOCUMENT_REQUIREMENT_UPDATED:
    'compliance.document_requirement_updated',
  COMPLIANCE_DOCUMENT_REQUIREMENT_DELETED:
    'compliance.document_requirement_deleted',

  // Compliance — status transition rules
  COMPLIANCE_STATUS_RULE_CREATED: 'compliance.status_rule_created',
  COMPLIANCE_STATUS_RULE_UPDATED: 'compliance.status_rule_updated',
  COMPLIANCE_STATUS_RULE_DELETED: 'compliance.status_rule_deleted',

  // Integrations
  INTEGRATION_CREATED: 'integration.created',
  INTEGRATION_UPDATED: 'integration.updated',
  INTEGRATION_DELETED: 'integration.deleted',
  INTEGRATION_DELIVERY_SENT: 'integration.delivery_sent',
  INTEGRATION_DELIVERY_FAILED: 'integration.delivery_failed',
  INTEGRATION_DELIVERY_RETRIED: 'integration.delivery_retried',

  // Exports
  EXPORT_REQUESTED: 'export.requested',
  EXPORT_COMPLETED: 'export.completed',
  EXPORT_FAILED: 'export.failed',

  // Imports
  IMPORT_STARTED: 'import.started',
  IMPORT_COMPLETED: 'import.completed',
  IMPORT_FAILED: 'import.failed',

  // Client portal access
  PORTAL_ACCESS_GRANTED: 'portal_access.granted',
  PORTAL_ACCESS_REVOKED: 'portal_access.revoked',
  PORTAL_DOCUMENT_DOWNLOADED: 'portal_document.downloaded',

  // AI / Intelligence
  AI_QUERY_EXECUTED: 'ai.query_executed',
  AI_SUMMARY_GENERATED: 'ai.summary_generated',
  AI_SIGNALS_VIEWED: 'ai.signals_viewed',

  // Subscriptions / billing
  SUBSCRIPTION_ASSIGNED: 'subscription.assigned',
  SUBSCRIPTION_UPDATED: 'subscription.updated',

  // Feature flags
  FEATURE_FLAG_CREATED: 'feature_flag.created',
  FEATURE_FLAG_UPDATED: 'feature_flag.updated',
  FEATURE_FLAG_DELETED: 'feature_flag.deleted',

  // Tariff classification
  TARIFF_SECTION_CREATED: 'tariff_section.created',
  TARIFF_SECTION_UPDATED: 'tariff_section.updated',
  TARIFF_SECTION_DELETED: 'tariff_section.deleted',
  TARIFF_CHAPTER_CREATED: 'tariff_chapter.created',
  TARIFF_CHAPTER_UPDATED: 'tariff_chapter.updated',
  TARIFF_CHAPTER_DELETED: 'tariff_chapter.deleted',
  TARIFF_HEADING_CREATED: 'tariff_heading.created',
  TARIFF_HEADING_UPDATED: 'tariff_heading.updated',
  TARIFF_HEADING_DELETED: 'tariff_heading.deleted',
  TARIFF_SUBHEADING_CREATED: 'tariff_subheading.created',
  TARIFF_SUBHEADING_UPDATED: 'tariff_subheading.updated',
  TARIFF_SUBHEADING_DELETED: 'tariff_subheading.deleted',
  TARIFF_FRACTION_CREATED: 'tariff_fraction.created',
  TARIFF_FRACTION_UPDATED: 'tariff_fraction.updated',
  TARIFF_FRACTION_DELETED: 'tariff_fraction.deleted',

  // Trade agreements
  TRADE_AGREEMENT_CREATED: 'trade_agreement.created',
  TRADE_AGREEMENT_UPDATED: 'trade_agreement.updated',
  TRADE_AGREEMENT_DELETED: 'trade_agreement.deleted',

  // Legal documents
  LEGAL_DOCUMENT_CREATED: 'legal_document.created',
  LEGAL_DOCUMENT_UPDATED: 'legal_document.updated',
  LEGAL_DOCUMENT_DELETED: 'legal_document.deleted',

  // Customs offices
  CUSTOMS_OFFICE_CREATED: 'customs_office.created',
  CUSTOMS_OFFICE_UPDATED: 'customs_office.updated',
  CUSTOMS_OFFICE_DELETED: 'customs_office.deleted',

  // Customs patents
  CUSTOMS_PATENT_CREATED: 'customs_patent.created',
  CUSTOMS_PATENT_UPDATED: 'customs_patent.updated',
  CUSTOMS_PATENT_DELETED: 'customs_patent.deleted',

  // Customs entries (pedimentos)
  CUSTOMS_ENTRY_CREATED: 'customs_entry.created',
  CUSTOMS_ENTRY_UPDATED: 'customs_entry.updated',
  CUSTOMS_ENTRY_DELETED: 'customs_entry.deleted',
  CUSTOMS_ENTRY_STATUS_CHANGED: 'customs_entry.status_changed',
  CUSTOMS_ENTRY_PREVALIDATED: 'customs_entry.prevalidated',
  CUSTOMS_ENTRY_ITEM_ADDED: 'customs_entry.item_added',
  CUSTOMS_ENTRY_ITEM_UPDATED: 'customs_entry.item_updated',
  CUSTOMS_ENTRY_ITEM_REMOVED: 'customs_entry.item_removed',
  CUSTOMS_ENTRY_PARTY_ADDED: 'customs_entry.party_added',
  CUSTOMS_ENTRY_PARTY_REMOVED: 'customs_entry.party_removed',
  CUSTOMS_ENTRY_DOCUMENT_ADDED: 'customs_entry.document_added',
  CUSTOMS_ENTRY_DOCUMENT_REMOVED: 'customs_entry.document_removed',

  // Shipments / Customs operations
  SHIPMENT_CREATED: 'shipment.created',
  SHIPMENT_UPDATED: 'shipment.updated',
  SHIPMENT_DELETED: 'shipment.deleted',
  SHIPMENT_STATUS_CHANGED: 'shipment.status_changed',
  SHIPMENT_STAGE_ADDED: 'shipment.stage_added',
  SHIPMENT_STAGE_COMPLETED: 'shipment.stage_completed',
  SHIPMENT_ENTRY_LINKED: 'shipment.entry_linked',
  SHIPMENT_ENTRY_UNLINKED: 'shipment.entry_unlinked',
  SHIPMENT_COMMENT_ADDED: 'shipment.comment_added',

  // Customs valuation (Manifestación de Valor)
  VALUATION_CREATED: 'valuation.created',
  VALUATION_UPDATED: 'valuation.updated',
  VALUATION_DELETED: 'valuation.deleted',
  VALUATION_STATUS_CHANGED: 'valuation.status_changed',
  VALUATION_ITEM_ADDED: 'valuation.item_added',
  VALUATION_ITEM_UPDATED: 'valuation.item_updated',
  VALUATION_ITEM_REMOVED: 'valuation.item_removed',
  VALUATION_COST_ADDED: 'valuation.cost_added',
  VALUATION_COST_UPDATED: 'valuation.cost_updated',
  VALUATION_COST_REMOVED: 'valuation.cost_removed',

  // COVE / E-Documents
  E_DOCUMENT_CREATED: 'e_document.created',
  E_DOCUMENT_UPDATED: 'e_document.updated',
  E_DOCUMENT_DELETED: 'e_document.deleted',
  E_DOCUMENT_STATUS_CHANGED: 'e_document.status_changed',
  E_DOCUMENT_TRANSMITTED: 'e_document.transmitted',
  E_DOCUMENT_ITEM_ADDED: 'e_document.item_added',
  E_DOCUMENT_ITEM_UPDATED: 'e_document.item_updated',
  E_DOCUMENT_ITEM_REMOVED: 'e_document.item_removed',

  // Billing — Invoices
  INVOICE_CREATED: 'invoice.created',
  INVOICE_UPDATED: 'invoice.updated',
  INVOICE_DELETED: 'invoice.deleted',
  INVOICE_ISSUED: 'invoice.issued',
  INVOICE_CANCELLED: 'invoice.cancelled',
  INVOICE_ITEM_ADDED: 'invoice.item_added',
  INVOICE_ITEM_UPDATED: 'invoice.item_updated',
  INVOICE_ITEM_REMOVED: 'invoice.item_removed',

  // Billing — Payments
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_CONFIRMED: 'payment.confirmed',
  PAYMENT_CANCELLED: 'payment.cancelled',

  // Billing — Expense Accounts
  EXPENSE_ACCOUNT_CREATED: 'expense_account.created',
  EXPENSE_ACCOUNT_UPDATED: 'expense_account.updated',
  EXPENSE_ACCOUNT_DELETED: 'expense_account.deleted',
  EXPENSE_ACCOUNT_STATUS_CHANGED: 'expense_account.status_changed',
  EXPENSE_ACCOUNT_ITEM_ADDED: 'expense_account.item_added',
  EXPENSE_ACCOUNT_ITEM_UPDATED: 'expense_account.item_updated',
  EXPENSE_ACCOUNT_ITEM_REMOVED: 'expense_account.item_removed',

  // Treasury — Bank Accounts
  BANK_ACCOUNT_CREATED: 'bank_account.created',
  BANK_ACCOUNT_UPDATED: 'bank_account.updated',
  BANK_ACCOUNT_DELETED: 'bank_account.deleted',

  // Treasury — Fund Movements
  FUND_MOVEMENT_CREATED: 'fund_movement.created',
  FUND_MOVEMENT_CONFIRMED: 'fund_movement.confirmed',
  FUND_MOVEMENT_RECONCILED: 'fund_movement.reconciled',
  FUND_MOVEMENT_CANCELLED: 'fund_movement.cancelled',

  // Document Management — Folders
  DOC_FOLDER_CREATED: 'doc_folder.created',
  DOC_FOLDER_UPDATED: 'doc_folder.updated',
  DOC_FOLDER_DELETED: 'doc_folder.deleted',

  // Document Management — Templates
  DOC_TEMPLATE_CREATED: 'doc_template.created',
  DOC_TEMPLATE_UPDATED: 'doc_template.updated',
  DOC_TEMPLATE_DELETED: 'doc_template.deleted',

  // Document Management — Checklists
  DOC_CHECKLIST_CREATED: 'doc_checklist.created',
  DOC_CHECKLIST_UPDATED: 'doc_checklist.updated',
  DOC_CHECKLIST_DELETED: 'doc_checklist.deleted',
  DOC_CHECKLIST_ITEM_ADDED: 'doc_checklist.item_added',
  DOC_CHECKLIST_ITEM_UPDATED: 'doc_checklist.item_updated',
  DOC_CHECKLIST_ITEM_REMOVED: 'doc_checklist.item_removed',

  // Warehouse Control
  WAREHOUSE_CREATED: 'warehouse.created',
  WAREHOUSE_UPDATED: 'warehouse.updated',
  WAREHOUSE_DELETED: 'warehouse.deleted',
  WAREHOUSE_ZONE_CREATED: 'warehouse.zone_created',
  WAREHOUSE_ZONE_UPDATED: 'warehouse.zone_updated',
  WAREHOUSE_ZONE_DELETED: 'warehouse.zone_deleted',
  WAREHOUSE_INVENTORY_CREATED: 'warehouse.inventory_created',
  WAREHOUSE_INVENTORY_UPDATED: 'warehouse.inventory_updated',
  WAREHOUSE_INVENTORY_DELETED: 'warehouse.inventory_deleted',
  WAREHOUSE_MOVEMENT_CREATED: 'warehouse.movement_created',
  WAREHOUSE_MOVEMENT_COMPLETED: 'warehouse.movement_completed',
  WAREHOUSE_MOVEMENT_CANCELLED: 'warehouse.movement_cancelled',

  // CUPO Letters
  CUPO_LETTER_CREATED: 'cupo_letter.created',
  CUPO_LETTER_UPDATED: 'cupo_letter.updated',
  CUPO_LETTER_DELETED: 'cupo_letter.deleted',
  CUPO_LETTER_STATUS_CHANGED: 'cupo_letter.status_changed',
  CUPO_LETTER_USAGE_REGISTERED: 'cupo_letter.usage_registered',
  CUPO_LETTER_USAGE_DELETED: 'cupo_letter.usage_deleted',

  // Notifications
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_BULK_SENT: 'notification.bulk_sent',
  NOTIFICATION_PREFERENCES_UPDATED: 'notification.preferences_updated',

  // Security / Auth
  AUTH_LOGIN_FAILED: 'auth.login_failed',
  AUTH_ACCOUNT_LOCKED: 'auth.account_locked',
  AUTH_RATE_LIMITED: 'auth.rate_limited',

  // Analytics & BI
  REPORT_CREATED: 'report.created',
  REPORT_UPDATED: 'report.updated',
  REPORT_DELETED: 'report.deleted',
  REPORT_EXECUTED: 'report.executed',
  REPORT_EXPORTED: 'report.exported',
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
