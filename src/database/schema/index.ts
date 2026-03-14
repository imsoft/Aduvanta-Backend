// Better Auth tables (read-only — managed by Better Auth, not drizzle-kit)
export * from './auth.schema.js';

// Application tables (managed by drizzle-kit migrations)
export * from './organizations.schema.js';
export * from './memberships.schema.js';
export * from './audit-logs.schema.js';
export * from './clients.schema.js';
export * from './client-contacts.schema.js';
export * from './client-addresses.schema.js';
export * from './operations.schema.js';
export * from './operation-status-history.schema.js';
export * from './operation-comments.schema.js';
export * from './document-categories.schema.js';
export * from './documents.schema.js';
export * from './document-versions.schema.js';
export * from './client-portal-access.schema.js';
export * from './operation-charges.schema.js';
export * from './operation-advances.schema.js';
export * from './rule-sets.schema.js';
export * from './document-requirements.schema.js';
export * from './status-transition-rules.schema.js';
export * from './integrations.schema.js';
export * from './integration-deliveries.schema.js';
export * from './export-jobs.schema.js';
export * from './import-jobs.schema.js';
export * from './plans.schema.js';
export * from './organization-subscriptions.schema.js';
export * from './feature-flags.schema.js';
