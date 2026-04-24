export const PERMISSION = {
  // Organizations
  ORGANIZATIONS_READ: 'organizations.read',
  ORGANIZATIONS_UPDATE: 'organizations.update',
  ORGANIZATIONS_DELETE: 'organizations.delete',

  // Members
  MEMBERS_READ: 'members.read',
  MEMBERS_INVITE: 'members.invite',
  MEMBERS_REMOVE: 'members.remove',
  MEMBERS_UPDATE_ROLE: 'members.update_role',

  // Roles
  ROLES_READ: 'roles.read',
  ROLES_MANAGE: 'roles.manage',

  // Audit logs
  AUDIT_LOGS_READ: 'audit_logs.read',

  // Users
  USERS_READ: 'users.read',

  // Clients
  CLIENTS_READ: 'clients.read',
  CLIENTS_CREATE: 'clients.create',
  CLIENTS_UPDATE: 'clients.update',
  CLIENTS_DELETE: 'clients.delete',

  // Client contacts
  CLIENT_CONTACTS_READ: 'client_contacts.read',
  CLIENT_CONTACTS_CREATE: 'client_contacts.create',
  CLIENT_CONTACTS_UPDATE: 'client_contacts.update',
  CLIENT_CONTACTS_DELETE: 'client_contacts.delete',

  // Client addresses
  CLIENT_ADDRESSES_READ: 'client_addresses.read',
  CLIENT_ADDRESSES_CREATE: 'client_addresses.create',
  CLIENT_ADDRESSES_UPDATE: 'client_addresses.update',
  CLIENT_ADDRESSES_DELETE: 'client_addresses.delete',

  // Operations
  OPERATIONS_READ: 'operations.read',
  OPERATIONS_CREATE: 'operations.create',
  OPERATIONS_UPDATE: 'operations.update',
  OPERATIONS_DELETE: 'operations.delete',
  OPERATIONS_ASSIGN: 'operations.assign',
  OPERATIONS_CHANGE_STATUS: 'operations.change_status',
  OPERATIONS_COMMENT: 'operations.comment',

  // Operation history
  OPERATION_HISTORY_READ: 'operation_history.read',

  // Document categories
  DOCUMENT_CATEGORIES_READ: 'document_categories.read',
  DOCUMENT_CATEGORIES_CREATE: 'document_categories.create',
  DOCUMENT_CATEGORIES_UPDATE: 'document_categories.update',
  DOCUMENT_CATEGORIES_DELETE: 'document_categories.delete',

  // Documents
  DOCUMENTS_READ: 'documents.read',
  DOCUMENTS_CREATE: 'documents.create',
  DOCUMENTS_UPDATE: 'documents.update',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  DOCUMENTS_UPLOAD_VERSION: 'documents.upload_version',

  // Finance
  FINANCE_READ: 'finance.read',
  FINANCE_CREATE_CHARGE: 'finance.create_charge',
  FINANCE_UPDATE_CHARGE: 'finance.update_charge',
  FINANCE_DELETE_CHARGE: 'finance.delete_charge',
  FINANCE_CREATE_ADVANCE: 'finance.create_advance',
  FINANCE_UPDATE_ADVANCE: 'finance.update_advance',
  FINANCE_DELETE_ADVANCE: 'finance.delete_advance',
  FINANCE_GENERATE_EXPENSE_ACCOUNT: 'finance.generate_expense_account',

  // Compliance
  COMPLIANCE_READ: 'compliance.read',
  COMPLIANCE_EVALUATE: 'compliance.evaluate',
  COMPLIANCE_MANAGE_RULE_SETS: 'compliance.manage_rule_sets',
  COMPLIANCE_MANAGE_DOCUMENT_REQUIREMENTS:
    'compliance.manage_document_requirements',
  COMPLIANCE_MANAGE_STATUS_RULES: 'compliance.manage_status_rules',

  // Integrations
  INTEGRATIONS_READ: 'integrations.read',
  INTEGRATIONS_MANAGE: 'integrations.manage',
  INTEGRATIONS_RUN: 'integrations.run',
  INTEGRATIONS_LOGS_READ: 'integrations.logs.read',

  // Exports
  EXPORTS_GENERATE: 'exports.generate',
  EXPORTS_READ: 'exports.read',

  // Imports
  IMPORTS_RUN: 'imports.run',
  IMPORTS_READ: 'imports.read',

  // Client portal (external client-facing)
  PORTAL_READ: 'portal.read',
  PORTAL_OPERATIONS_READ: 'portal_operations.read',
  PORTAL_DOCUMENTS_READ: 'portal_documents.read',
  PORTAL_DOCUMENTS_DOWNLOAD: 'portal_documents.download',
  PORTAL_COMMENTS_READ: 'portal_comments.read',

  // Client portal access management (internal staff only)
  PORTAL_ACCESS_MANAGE: 'portal_access.manage',

  // AI / Intelligence
  AI_READ: 'ai.read',
  AI_SEARCH: 'ai.search',
  AI_GENERATE_SUMMARY: 'ai.generate_summary',
  AI_VIEW_SIGNALS: 'ai.view_signals',

  // Billing / SaaS plans
  BILLING_READ: 'billing.read',
  BILLING_MANAGE: 'billing.manage',
  PLANS_READ: 'plans.read',
  USAGE_READ: 'usage.read',

  // Feature flags
  FEATURE_FLAGS_READ: 'feature_flags.read',
  FEATURE_FLAGS_MANAGE: 'feature_flags.manage',

  // Tariff classification (TIGIE)
  TARIFF_READ: 'tariff.read',
  TARIFF_CREATE: 'tariff.create',
  TARIFF_UPDATE: 'tariff.update',
  TARIFF_DELETE: 'tariff.delete',
  TARIFF_SEARCH: 'tariff.search',

  // Trade agreements
  TRADE_AGREEMENTS_READ: 'trade_agreements.read',
  TRADE_AGREEMENTS_CREATE: 'trade_agreements.create',
  TRADE_AGREEMENTS_UPDATE: 'trade_agreements.update',
  TRADE_AGREEMENTS_DELETE: 'trade_agreements.delete',

  // Legal documents
  LEGAL_DOCUMENTS_READ: 'legal_documents.read',
  LEGAL_DOCUMENTS_CREATE: 'legal_documents.create',
  LEGAL_DOCUMENTS_UPDATE: 'legal_documents.update',
  LEGAL_DOCUMENTS_DELETE: 'legal_documents.delete',

  // Customs offices (reference data)
  CUSTOMS_OFFICES_READ: 'customs_offices.read',
  CUSTOMS_OFFICES_CREATE: 'customs_offices.create',
  CUSTOMS_OFFICES_UPDATE: 'customs_offices.update',
  CUSTOMS_OFFICES_DELETE: 'customs_offices.delete',

  // Customs patents
  CUSTOMS_PATENTS_READ: 'customs_patents.read',
  CUSTOMS_PATENTS_CREATE: 'customs_patents.create',
  CUSTOMS_PATENTS_UPDATE: 'customs_patents.update',
  CUSTOMS_PATENTS_DELETE: 'customs_patents.delete',

  // Customs entries (pedimentos)
  CUSTOMS_ENTRIES_READ: 'customs_entries.read',
  CUSTOMS_ENTRIES_CREATE: 'customs_entries.create',
  CUSTOMS_ENTRIES_UPDATE: 'customs_entries.update',
  CUSTOMS_ENTRIES_DELETE: 'customs_entries.delete',
  CUSTOMS_ENTRIES_CHANGE_STATUS: 'customs_entries.change_status',
  CUSTOMS_ENTRIES_PREVALIDATE: 'customs_entries.prevalidate',
  CUSTOMS_ENTRIES_SEARCH: 'customs_entries.search',

  // Shipments / Customs operations
  SHIPMENTS_READ: 'shipments.read',
  SHIPMENTS_CREATE: 'shipments.create',
  SHIPMENTS_UPDATE: 'shipments.update',
  SHIPMENTS_DELETE: 'shipments.delete',
  SHIPMENTS_CHANGE_STATUS: 'shipments.change_status',
  SHIPMENTS_SEARCH: 'shipments.search',
  SHIPMENTS_ADD_STAGE: 'shipments.add_stage',
  SHIPMENTS_COMMENT: 'shipments.comment',
  SHIPMENTS_LINK_ENTRY: 'shipments.link_entry',

  // Customs valuation (Manifestación de Valor)
  VALUATIONS_READ: 'valuations.read',
  VALUATIONS_CREATE: 'valuations.create',
  VALUATIONS_UPDATE: 'valuations.update',
  VALUATIONS_DELETE: 'valuations.delete',
  VALUATIONS_CHANGE_STATUS: 'valuations.change_status',
  VALUATIONS_SEARCH: 'valuations.search',

  // COVE / E-Documents
  E_DOCUMENTS_READ: 'e_documents.read',
  E_DOCUMENTS_CREATE: 'e_documents.create',
  E_DOCUMENTS_UPDATE: 'e_documents.update',
  E_DOCUMENTS_DELETE: 'e_documents.delete',
  E_DOCUMENTS_TRANSMIT: 'e_documents.transmit',
  E_DOCUMENTS_SEARCH: 'e_documents.search',

  // Billing — Invoices
  INVOICES_READ: 'invoices.read',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_UPDATE: 'invoices.update',
  INVOICES_DELETE: 'invoices.delete',
  INVOICES_ISSUE: 'invoices.issue',
  INVOICES_CANCEL: 'invoices.cancel',
  INVOICES_SEARCH: 'invoices.search',

  // Billing — Payments
  PAYMENTS_READ: 'payments.read',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_CONFIRM: 'payments.confirm',
  PAYMENTS_CANCEL: 'payments.cancel',

  // Billing — Expense Accounts (Cuenta de Gastos)
  EXPENSE_ACCOUNTS_READ: 'expense_accounts.read',
  EXPENSE_ACCOUNTS_CREATE: 'expense_accounts.create',
  EXPENSE_ACCOUNTS_UPDATE: 'expense_accounts.update',
  EXPENSE_ACCOUNTS_DELETE: 'expense_accounts.delete',
  EXPENSE_ACCOUNTS_SEARCH: 'expense_accounts.search',

  // Treasury — Bank Accounts
  BANK_ACCOUNTS_READ: 'bank_accounts.read',
  BANK_ACCOUNTS_CREATE: 'bank_accounts.create',
  BANK_ACCOUNTS_UPDATE: 'bank_accounts.update',
  BANK_ACCOUNTS_DELETE: 'bank_accounts.delete',

  // Treasury — Fund Movements
  FUND_MOVEMENTS_READ: 'fund_movements.read',
  FUND_MOVEMENTS_CREATE: 'fund_movements.create',
  FUND_MOVEMENTS_CONFIRM: 'fund_movements.confirm',
  FUND_MOVEMENTS_RECONCILE: 'fund_movements.reconcile',
  FUND_MOVEMENTS_CANCEL: 'fund_movements.cancel',
  FUND_MOVEMENTS_SEARCH: 'fund_movements.search',

  // Treasury — Client Balances
  CLIENT_BALANCES_READ: 'client_balances.read',

  // Document Management — Folders
  DOC_FOLDERS_READ: 'doc_folders.read',
  DOC_FOLDERS_CREATE: 'doc_folders.create',
  DOC_FOLDERS_UPDATE: 'doc_folders.update',
  DOC_FOLDERS_DELETE: 'doc_folders.delete',

  // Document Management — Templates
  DOC_TEMPLATES_READ: 'doc_templates.read',
  DOC_TEMPLATES_CREATE: 'doc_templates.create',
  DOC_TEMPLATES_UPDATE: 'doc_templates.update',
  DOC_TEMPLATES_DELETE: 'doc_templates.delete',

  // Document Management — Checklists
  DOC_CHECKLISTS_READ: 'doc_checklists.read',
  DOC_CHECKLISTS_CREATE: 'doc_checklists.create',
  DOC_CHECKLISTS_UPDATE: 'doc_checklists.update',
  DOC_CHECKLISTS_DELETE: 'doc_checklists.delete',

  // Warehouse Control — Warehouses
  WAREHOUSES_READ: 'warehouses.read',
  WAREHOUSES_CREATE: 'warehouses.create',
  WAREHOUSES_UPDATE: 'warehouses.update',
  WAREHOUSES_DELETE: 'warehouses.delete',

  // Warehouse Control — Inventory
  WAREHOUSE_INVENTORY_READ: 'warehouse_inventory.read',
  WAREHOUSE_INVENTORY_CREATE: 'warehouse_inventory.create',
  WAREHOUSE_INVENTORY_UPDATE: 'warehouse_inventory.update',
  WAREHOUSE_INVENTORY_DELETE: 'warehouse_inventory.delete',
  WAREHOUSE_INVENTORY_SEARCH: 'warehouse_inventory.search',

  // Warehouse Control — Movements
  WAREHOUSE_MOVEMENTS_READ: 'warehouse_movements.read',
  WAREHOUSE_MOVEMENTS_CREATE: 'warehouse_movements.create',
  WAREHOUSE_MOVEMENTS_COMPLETE: 'warehouse_movements.complete',
  WAREHOUSE_MOVEMENTS_CANCEL: 'warehouse_movements.cancel',

  // CUPO Letters
  CUPO_LETTERS_READ: 'cupo_letters.read',
  CUPO_LETTERS_CREATE: 'cupo_letters.create',
  CUPO_LETTERS_UPDATE: 'cupo_letters.update',
  CUPO_LETTERS_DELETE: 'cupo_letters.delete',
  CUPO_LETTERS_CHANGE_STATUS: 'cupo_letters.change_status',
  CUPO_LETTERS_REGISTER_USAGE: 'cupo_letters.register_usage',
  CUPO_LETTERS_SEARCH: 'cupo_letters.search',

  // Notifications
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_CREATE: 'notifications.create',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  NOTIFICATIONS_PREFERENCES_UPDATE: 'notifications.preferences_update',

  // Analytics & BI
  ANALYTICS_READ: 'analytics.read',
  ANALYTICS_REPORTS_CREATE: 'analytics.reports_create',
  ANALYTICS_REPORTS_UPDATE: 'analytics.reports_update',
  ANALYTICS_REPORTS_DELETE: 'analytics.reports_delete',
  ANALYTICS_REPORTS_EXECUTE: 'analytics.reports_execute',
  ANALYTICS_REPORTS_EXPORT: 'analytics.reports_export',
  ANALYTICS_KPI_READ: 'analytics.kpi_read',

  // Customs Inspections (Semáforo / Reconocimiento Aduanal)
  CUSTOMS_INSPECTIONS_READ: 'customs_inspections.read',
  CUSTOMS_INSPECTIONS_CREATE: 'customs_inspections.create',
  CUSTOMS_INSPECTIONS_UPDATE: 'customs_inspections.update',

  // Customs Previos (Pre-inspección)
  CUSTOMS_PREVIOS_READ: 'customs_previos.read',
  CUSTOMS_PREVIOS_CREATE: 'customs_previos.create',
  CUSTOMS_PREVIOS_UPDATE: 'customs_previos.update',

  // Importer / Exporter Registry (Padrón de Importadores)
  IMPORTER_REGISTRY_READ: 'importer_registry.read',
  IMPORTER_REGISTRY_CREATE: 'importer_registry.create',
  IMPORTER_REGISTRY_UPDATE: 'importer_registry.update',

  // IMMEX Programs
  IMMEX_PROGRAMS_READ: 'immex_programs.read',
  IMMEX_PROGRAMS_CREATE: 'immex_programs.create',
  IMMEX_PROGRAMS_UPDATE: 'immex_programs.update',

  // Customs Rectifications
  CUSTOMS_RECTIFICATIONS_READ: 'customs_rectifications.read',
  CUSTOMS_RECTIFICATIONS_CREATE: 'customs_rectifications.create',
  CUSTOMS_RECTIFICATIONS_UPDATE: 'customs_rectifications.update',

  // Client Accounts (Cuenta Corriente)
  CLIENT_ACCOUNTS_READ: 'client_accounts.read',
  CLIENT_ACCOUNTS_WRITE: 'client_accounts.write',
} as const;

export type Permission = (typeof PERMISSION)[keyof typeof PERMISSION];
