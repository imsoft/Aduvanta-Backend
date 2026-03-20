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

// Tariff classification (TIGIE)
export * from './tariff-sections.schema.js';
export * from './tariff-chapters.schema.js';
export * from './tariff-headings.schema.js';
export * from './tariff-subheadings.schema.js';
export * from './tariff-fractions.schema.js';
export * from './tariff-regulations.schema.js';
export * from './trade-agreements.schema.js';
export * from './tariff-agreement-preferences.schema.js';
export * from './legal-documents.schema.js';

// Customs entries (pedimentos)
export * from './customs-offices.schema.js';
export * from './customs-patents.schema.js';
export * from './customs-entries.schema.js';
export * from './customs-entry-parties.schema.js';
export * from './customs-entry-items.schema.js';
export * from './customs-entry-item-taxes.schema.js';
export * from './customs-entry-documents.schema.js';
export * from './customs-entry-status-history.schema.js';

// Shipments / Customs operations (tráfico y despacho)
export * from './shipments.schema.js';
export * from './shipment-stages.schema.js';
export * from './shipment-entries.schema.js';
export * from './shipment-comments.schema.js';

// Customs valuation (Manifestación de Valor en Aduana)
export * from './valuation-declarations.schema.js';
export * from './valuation-items.schema.js';
export * from './valuation-costs.schema.js';

// COVE / E-Documents (Comprobante de Valor Electrónico)
export * from './e-documents.schema.js';
export * from './e-document-items.schema.js';
export * from './e-document-transmissions.schema.js';

// Billing (facturación, cuenta de gastos, pagos)
export * from './invoices.schema.js';
export * from './invoice-items.schema.js';
export * from './payments.schema.js';
export * from './expense-accounts.schema.js';
export * from './expense-account-items.schema.js';

// Treasury (tesorería, cuentas bancarias, movimientos)
export * from './bank-accounts.schema.js';
export * from './fund-movements.schema.js';
export * from './client-balances.schema.js';

// Document management (gestión documental)
export * from './document-folders.schema.js';
export * from './document-templates.schema.js';
export * from './document-checklists.schema.js';
export * from './document-checklist-items.schema.js';

// Warehouse control (control de almacén)
export * from './warehouses.schema.js';
export * from './warehouse-zones.schema.js';
export * from './warehouse-inventory.schema.js';
export * from './warehouse-movements.schema.js';

// CUPO letters (cartas CUPO / cupos arancelarios)
export * from './cupo-letters.schema.js';
export * from './cupo-letter-usages.schema.js';

// Notifications (notificaciones)
export * from './notifications.schema.js';
export * from './notification-preferences.schema.js';

// Analytics & BI (reportes, KPIs)
export * from './saved-reports.schema.js';
export * from './report-executions.schema.js';
export * from './kpi-snapshots.schema.js';
