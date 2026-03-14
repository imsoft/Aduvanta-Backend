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
  COMPLIANCE_MANAGE_DOCUMENT_REQUIREMENTS: 'compliance.manage_document_requirements',
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
  PLANS_READ: 'plans.read',
  USAGE_READ: 'usage.read',

  // Feature flags
  FEATURE_FLAGS_READ: 'feature_flags.read',
  FEATURE_FLAGS_MANAGE: 'feature_flags.manage',
} as const;

export type Permission = (typeof PERMISSION)[keyof typeof PERMISSION];
