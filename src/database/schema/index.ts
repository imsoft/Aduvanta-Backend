// Better Auth tables (read-only — managed by Better Auth, not drizzle-kit)
export * from './auth.schema';

// Application tables (managed by drizzle-kit migrations)
export * from './system-admins.schema';
export * from './organizations.schema';
export * from './memberships.schema';
export * from './audit-logs.schema';
export * from './clients.schema';
export * from './client-contacts.schema';
export * from './client-addresses.schema';
export * from './operations.schema';
export * from './operation-status-history.schema';
export * from './operation-comments.schema';
export * from './document-categories.schema';
export * from './documents.schema';
export * from './document-versions.schema';
export * from './client-portal-access.schema';
export * from './operation-charges.schema';
export * from './operation-advances.schema';
export * from './rule-sets.schema';
export * from './document-requirements.schema';
export * from './status-transition-rules.schema';
export * from './integrations.schema';
export * from './integration-deliveries.schema';
export * from './export-jobs.schema';
export * from './import-jobs.schema';
export * from './plans.schema';
export * from './organization-subscriptions.schema';
export * from './stripe-processed-events.schema';
export * from './feature-flags.schema';

// Tariff classification (TIGIE)
export * from './tariff-sections.schema';
export * from './tariff-chapters.schema';
export * from './tariff-headings.schema';
export * from './tariff-subheadings.schema';
export * from './tariff-fractions.schema';
export * from './tariff-regulations.schema';
export * from './trade-agreements.schema';
export * from './tariff-agreement-preferences.schema';
export * from './legal-documents.schema';

// Customs entries (pedimentos)
export * from './customs-offices.schema';
export * from './customs-patents.schema';
export * from './customs-entries.schema';
export * from './customs-entry-parties.schema';
export * from './customs-entry-items.schema';
export * from './customs-entry-item-taxes.schema';
export * from './customs-entry-documents.schema';
export * from './customs-entry-status-history.schema';

// Shipments / Customs operations (tráfico y despacho)
export * from './shipments.schema';
export * from './shipment-stages.schema';
export * from './shipment-entries.schema';
export * from './shipment-comments.schema';

// Customs valuation (Manifestación de Valor en Aduana)
export * from './valuation-declarations.schema';
export * from './valuation-items.schema';
export * from './valuation-costs.schema';

// COVE / E-Documents (Comprobante de Valor Electrónico)
export * from './e-documents.schema';
export * from './e-document-items.schema';
export * from './e-document-transmissions.schema';

// Billing (facturación, cuenta de gastos, pagos)
export * from './invoices.schema';
export * from './invoice-items.schema';
export * from './payments.schema';
export * from './expense-accounts.schema';
export * from './expense-account-items.schema';

// Treasury (tesorería, cuentas bancarias, movimientos)
export * from './bank-accounts.schema';
export * from './fund-movements.schema';
export * from './client-balances.schema';

// Document management (gestión documental)
export * from './document-folders.schema';
export * from './document-templates.schema';
export * from './document-checklists.schema';
export * from './document-checklist-items.schema';

// Warehouse control (control de almacén)
export * from './warehouses.schema';
export * from './warehouse-zones.schema';
export * from './warehouse-inventory.schema';
export * from './warehouse-movements.schema';

// CUPO letters (cartas CUPO / cupos arancelarios)
export * from './cupo-letters.schema';
export * from './cupo-letter-usages.schema';

// Notifications (notificaciones)
export * from './notifications.schema';
export * from './notification-preferences.schema';

// Analytics & BI (reportes, KPIs)
export * from './saved-reports.schema';
export * from './report-executions.schema';
export * from './kpi-snapshots.schema';
export * from './product-events.schema';

// Anexo 22 reference catalogs (catálogos oficiales SAT)
export * from './anexo22-customs-sections.schema';
export * from './anexo22-transport-means.schema';
export * from './anexo22-pedimento-keys.schema';
export * from './anexo22-customs-regimes.schema';
export * from './anexo22-units-of-measure.schema';
export * from './anexo22-countries.schema';
export * from './anexo22-currencies.schema';
export * from './anexo22-taxes.schema';
export * from './anexo22-identifiers.schema';
export * from './anexo22-rrna.schema';
export * from './anexo22-payment-methods.schema';
export * from './anexo22-container-types.schema';
export * from './anexo22-operation-types.schema';

// SAAI error codes (catálogo de errores del Sistema Automatizado Aduanero Integral)
export * from './saai-error-codes.schema';
export * from './saai-registro-types.schema';

// Customs inspections (semáforo fiscal, reconocimiento aduanero)
export * from './customs-inspections.schema';

// Customs previos (pre-inspección física)
export * from './customs-previos.schema';

// Importer / exporter registry (padrón de importadores / exportadores)
export * from './importer-registry.schema';

// IMMEX programs (manufactura, maquiladora, servicios)
export * from './immex-programs.schema';

// Customs rectifications (rectificaciones de pedimentos)
export * from './customs-rectifications.schema';

// Client account movements, statements and funds (cuenta corriente)
export * from './client-account-statements.schema';
