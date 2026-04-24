-- Migration 0015: Operational modules
-- Adds tables for: customs inspections, customs previos, importer registry,
-- IMMEX programs, customs rectifications, client account movements/statements/funds

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "inspection_type" AS ENUM (
  'DOCUMENTAL', 'FISICO_ALEATORIO', 'FISICO_SELECTIVO', 'FISICO_TOTAL', 'RECONOCIMIENTO_ADUANERO'
);

CREATE TYPE "inspection_result" AS ENUM (
  'PENDING', 'PASSED', 'DISCREPANCY', 'SEIZED', 'PARTIAL_SEIZURE', 'SAMPLE_TAKEN'
);

CREATE TYPE "semaphore_color" AS ENUM ('GREEN', 'RED');

CREATE TYPE "previo_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TYPE "previo_type" AS ENUM ('FULL', 'PARTIAL', 'SAMPLING');

CREATE TYPE "importer_registry_status" AS ENUM (
  'ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING', 'EXPIRED'
);

CREATE TYPE "importer_registry_type" AS ENUM ('GENERAL', 'SECTORIAL', 'BOTH');

CREATE TYPE "exporter_registry_status" AS ENUM (
  'ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING', 'EXPIRED'
);

CREATE TYPE "immex_program_type" AS ENUM (
  'MANUFACTURERA', 'MAQUILADORA', 'SERVICIOS', 'ALBERGUE', 'CONTROLADORA'
);

CREATE TYPE "immex_program_status" AS ENUM (
  'ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'IN_RENOVATION'
);

CREATE TYPE "immex_operation_type" AS ENUM (
  'IMPORT_TEMPORAL', 'EXPORT_VIRTUAL', 'TRANSFER', 'DEFINITIVE_CHANGE', 'RETURN'
);

CREATE TYPE "rectification_status" AS ENUM (
  'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'
);

CREATE TYPE "rectification_reason" AS ENUM (
  'DATA_ERROR', 'TARIFF_FRACTION', 'VALUE_ADJUSTMENT', 'DESCRIPTION_CORRECTION',
  'QUANTITY_ADJUSTMENT', 'REGIME_CHANGE', 'TAX_CORRECTION', 'PARTY_DATA', 'OTHER'
);

CREATE TYPE "account_movement_type" AS ENUM (
  'ADVANCE_RECEIVED', 'OVERPAYMENT_CREDIT', 'CORRECTION_CREDIT',
  'CUSTOMS_DUTIES_PAID', 'STORAGE_PAID', 'TRANSPORT_PAID',
  'AGENCY_FEE', 'OTHER_EXPENSES', 'INVOICE_CHARGED', 'CORRECTION_DEBIT'
);

CREATE TYPE "account_statement_status" AS ENUM (
  'DRAFT', 'SENT', 'ACKNOWLEDGED', 'DISPUTED', 'CLOSED'
);

-- ============================================================
-- CUSTOMS INSPECTIONS
-- ============================================================

CREATE TABLE "customs_inspections" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "entry_id" text NOT NULL REFERENCES "customs_entries"("id"),
  "shipment_id" text REFERENCES "shipments"("id"),
  "semaphore_color" "semaphore_color",
  "modulation_date" timestamptz,
  "inspection_type" "inspection_type",
  "inspection_result" "inspection_result" NOT NULL DEFAULT 'PENDING',
  "inspector_name" text,
  "inspector_badge" text,
  "inspection_location" text,
  "scheduled_at" timestamptz,
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "packages_inspected" integer,
  "discrepancies_found" boolean DEFAULT false,
  "discrepancy_description" text,
  "penalty_amount" numeric(16, 2),
  "penalty_currency" text,
  "samples_taken" integer DEFAULT 0,
  "sample_description" text,
  "acta_number" text,
  "acta_filed_at" timestamptz,
  "internal_notes" text,
  "metadata" jsonb,
  "created_by_id" text NOT NULL,
  "updated_by_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "customs_inspection_items" (
  "id" text PRIMARY KEY NOT NULL,
  "inspection_id" text NOT NULL REFERENCES "customs_inspections"("id") ON DELETE CASCADE,
  "entry_item_id" text,
  "declared_quantity" numeric(16, 4),
  "found_quantity" numeric(16, 4),
  "declared_tariff_fraction" text,
  "found_tariff_fraction" text,
  "description" text,
  "discrepancy_type" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CUSTOMS PREVIOS
-- ============================================================

CREATE TABLE "customs_previos" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "entry_id" text REFERENCES "customs_entries"("id"),
  "shipment_id" text REFERENCES "shipments"("id"),
  "previo_number" text NOT NULL,
  "type" "previo_type" NOT NULL DEFAULT 'FULL',
  "status" "previo_status" NOT NULL DEFAULT 'PENDING',
  "warehouse_name" text,
  "warehouse_address" text,
  "customs_office_id" text,
  "scheduled_at" timestamptz,
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "inspector_name" text,
  "supervisor_name" text,
  "declared_packages" integer,
  "found_packages" integer,
  "package_discrepancy" boolean DEFAULT false,
  "declared_gross_weight_kg" numeric(16, 4),
  "found_gross_weight_kg" numeric(16, 4),
  "container_numbers" text,
  "seal_numbers" text,
  "seal_intact" boolean,
  "discrepancies_found" boolean DEFAULT false,
  "discrepancy_notes" text,
  "photographs_taken" boolean DEFAULT false,
  "photograph_count" integer DEFAULT 0,
  "report_file_key" text,
  "internal_notes" text,
  "metadata" jsonb,
  "created_by_id" text NOT NULL,
  "updated_by_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "customs_previo_items" (
  "id" text PRIMARY KEY NOT NULL,
  "previo_id" text NOT NULL REFERENCES "customs_previos"("id") ON DELETE CASCADE,
  "entry_item_id" text,
  "sequence_number" integer NOT NULL,
  "tariff_fraction" text,
  "description" text NOT NULL,
  "brand" text,
  "model" text,
  "serial_numbers" text,
  "declared_quantity" numeric(16, 4),
  "found_quantity" numeric(16, 4),
  "unit_of_measure" text,
  "good_condition" boolean DEFAULT true,
  "damage_notes" text,
  "country_of_origin" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- IMPORTER REGISTRY
-- ============================================================

CREATE TABLE "importer_registry" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "client_id" text NOT NULL REFERENCES "clients"("id"),
  "registry_type" "importer_registry_type" NOT NULL DEFAULT 'GENERAL',
  "status" "importer_registry_status" NOT NULL DEFAULT 'ACTIVE',
  "rfc" text NOT NULL,
  "business_name" text NOT NULL,
  "inscription_date" date,
  "expiration_date" date,
  "last_verification_date" date,
  "sat_folio_number" text,
  "suspension_reason" text,
  "suspension_date" date,
  "internal_notes" text,
  "alert_sent" boolean DEFAULT false,
  "metadata" jsonb,
  "created_by_id" text NOT NULL,
  "updated_by_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "importer_registry_sectors" (
  "id" text PRIMARY KEY NOT NULL,
  "registry_id" text NOT NULL REFERENCES "importer_registry"("id") ON DELETE CASCADE,
  "sector_code" text NOT NULL,
  "sector_name" text NOT NULL,
  "inscription_date" date,
  "expiration_date" date,
  "status" "importer_registry_status" NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "exporter_registry" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "client_id" text NOT NULL REFERENCES "clients"("id"),
  "status" "exporter_registry_status" NOT NULL DEFAULT 'ACTIVE',
  "rfc" text NOT NULL,
  "business_name" text NOT NULL,
  "inscription_date" date,
  "expiration_date" date,
  "last_verification_date" date,
  "sat_folio_number" text,
  "internal_notes" text,
  "metadata" jsonb,
  "created_by_id" text NOT NULL,
  "updated_by_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- IMMEX PROGRAMS
-- ============================================================

CREATE TABLE "immex_programs" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "client_id" text NOT NULL REFERENCES "clients"("id"),
  "program_number" text NOT NULL,
  "program_type" "immex_program_type" NOT NULL,
  "status" "immex_program_status" NOT NULL DEFAULT 'ACTIVE',
  "rfc" text NOT NULL,
  "business_name" text NOT NULL,
  "authorization_date" date,
  "expiration_date" date,
  "last_renovation_date" date,
  "next_renovation_date" date,
  "annual_export_commitment_usd" numeric(16, 2),
  "last_year_exports_usd" numeric(16, 2),
  "renovation_alert_days" integer DEFAULT 90,
  "alert_sent" boolean DEFAULT false,
  "internal_notes" text,
  "metadata" jsonb,
  "created_by_id" text NOT NULL,
  "updated_by_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "immex_authorized_products" (
  "id" text PRIMARY KEY NOT NULL,
  "program_id" text NOT NULL REFERENCES "immex_programs"("id") ON DELETE CASCADE,
  "tariff_fraction" text NOT NULL,
  "description" text NOT NULL,
  "unit_of_measure" text,
  "authorized_quantity" numeric(16, 4),
  "authorized_value_usd" numeric(16, 2),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "immex_machinery" (
  "id" text PRIMARY KEY NOT NULL,
  "program_id" text NOT NULL REFERENCES "immex_programs"("id") ON DELETE CASCADE,
  "tariff_fraction" text NOT NULL,
  "description" text NOT NULL,
  "brand" text,
  "model" text,
  "serial_number" text,
  "quantity" integer NOT NULL DEFAULT 1,
  "entry_number" text,
  "import_date" date,
  "return_deadline" date,
  "returned_date" date,
  "is_returned" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "internal_notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "immex_virtual_operations" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "operation_type" "immex_operation_type" NOT NULL,
  "sender_program_id" text REFERENCES "immex_programs"("id"),
  "sender_rfc" text NOT NULL,
  "sender_business_name" text NOT NULL,
  "receiver_program_id" text REFERENCES "immex_programs"("id"),
  "receiver_rfc" text NOT NULL,
  "receiver_business_name" text NOT NULL,
  "virtual_pedimento_number" text,
  "complementary_pedimento_number" text,
  "operation_date" date NOT NULL,
  "total_value_usd" numeric(16, 2),
  "internal_notes" text,
  "metadata" jsonb,
  "created_by_id" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CUSTOMS RECTIFICATIONS
-- ============================================================

CREATE TABLE "customs_rectifications" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "original_entry_id" text NOT NULL REFERENCES "customs_entries"("id"),
  "rectification_entry_id" text REFERENCES "customs_entries"("id"),
  "sequence_number" integer NOT NULL DEFAULT 1,
  "status" "rectification_status" NOT NULL DEFAULT 'DRAFT',
  "reason" "rectification_reason" NOT NULL,
  "reason_description" text NOT NULL,
  "modified_fields" jsonb,
  "filed_at" timestamptz,
  "approved_at" timestamptz,
  "rejected_at" timestamptz,
  "sat_acknowledgment_number" text,
  "sat_rejection_reason" text,
  "internal_notes" text,
  "metadata" jsonb,
  "created_by_id" text NOT NULL,
  "updated_by_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "rectification_field_changes" (
  "id" text PRIMARY KEY NOT NULL,
  "rectification_id" text NOT NULL REFERENCES "customs_rectifications"("id") ON DELETE CASCADE,
  "field_path" text NOT NULL,
  "field_label" text NOT NULL,
  "old_value" text,
  "new_value" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CLIENT ACCOUNT MOVEMENTS, STATEMENTS, FUNDS
-- ============================================================

CREATE TABLE "client_account_movements" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "client_id" text NOT NULL REFERENCES "clients"("id"),
  "type" "account_movement_type" NOT NULL,
  "amount" numeric(16, 2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'MXN',
  "exchange_rate" numeric(12, 4),
  "operation_id" text,
  "entry_id" text,
  "invoice_id" text,
  "advance_id" text,
  "balance_before" numeric(16, 2),
  "balance_after" numeric(16, 2),
  "description" text NOT NULL,
  "reference" text,
  "movement_date" date NOT NULL,
  "is_reconciled" boolean NOT NULL DEFAULT false,
  "reconciled_at" timestamptz,
  "created_by_id" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "client_account_statements" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "client_id" text NOT NULL REFERENCES "clients"("id"),
  "statement_number" text NOT NULL,
  "status" "account_statement_status" NOT NULL DEFAULT 'DRAFT',
  "period_from" date NOT NULL,
  "period_to" date NOT NULL,
  "opening_balance" numeric(16, 2) NOT NULL,
  "total_credits" numeric(16, 2) NOT NULL,
  "total_debits" numeric(16, 2) NOT NULL,
  "closing_balance" numeric(16, 2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'MXN',
  "movement_count" integer NOT NULL DEFAULT 0,
  "notes" text,
  "sent_at" timestamptz,
  "sent_to_email" text,
  "acknowledged_at" timestamptz,
  "file_key" text,
  "created_by_id" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "client_funds" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "client_id" text NOT NULL REFERENCES "clients"("id") UNIQUE,
  "available_balance" numeric(16, 2) NOT NULL DEFAULT 0,
  "reserved_balance" numeric(16, 2) NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'MXN',
  "minimum_fund_alert" numeric(16, 2),
  "alert_sent" boolean NOT NULL DEFAULT false,
  "last_movement_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX ON "customs_inspections" ("organization_id");
CREATE INDEX ON "customs_inspections" ("entry_id");
CREATE INDEX ON "customs_previos" ("organization_id");
CREATE INDEX ON "customs_previos" ("entry_id");
CREATE INDEX ON "importer_registry" ("organization_id", "status");
CREATE INDEX ON "importer_registry" ("client_id");
CREATE INDEX ON "importer_registry" ("expiration_date");
CREATE INDEX ON "immex_programs" ("organization_id", "status");
CREATE INDEX ON "immex_programs" ("client_id");
CREATE INDEX ON "immex_programs" ("expiration_date");
CREATE INDEX ON "customs_rectifications" ("organization_id");
CREATE INDEX ON "customs_rectifications" ("original_entry_id");
CREATE INDEX ON "client_account_movements" ("organization_id", "client_id");
CREATE INDEX ON "client_account_movements" ("movement_date");
CREATE INDEX ON "client_account_statements" ("organization_id", "client_id");
CREATE INDEX ON "client_funds" ("organization_id");
