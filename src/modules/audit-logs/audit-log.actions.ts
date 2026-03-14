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
  COMPLIANCE_DOCUMENT_REQUIREMENT_CREATED: 'compliance.document_requirement_created',
  COMPLIANCE_DOCUMENT_REQUIREMENT_UPDATED: 'compliance.document_requirement_updated',
  COMPLIANCE_DOCUMENT_REQUIREMENT_DELETED: 'compliance.document_requirement_deleted',

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
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
