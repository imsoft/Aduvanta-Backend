CREATE TYPE "public"."bank_account_type" AS ENUM('CHECKING', 'SAVINGS', 'INVESTMENT', 'PETTY_CASH', 'CUSTOMS_GUARANTEE');--> statement-breakpoint
CREATE TYPE "public"."account_movement_type" AS ENUM('ADVANCE_RECEIVED', 'OVERPAYMENT_CREDIT', 'CORRECTION_CREDIT', 'CUSTOMS_DUTIES_PAID', 'STORAGE_PAID', 'TRANSPORT_PAID', 'AGENCY_FEE', 'OTHER_EXPENSES', 'INVOICE_CHARGED', 'CORRECTION_DEBIT');--> statement-breakpoint
CREATE TYPE "public"."account_statement_status" AS ENUM('DRAFT', 'SENT', 'ACKNOWLEDGED', 'DISPUTED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."cupo_letter_status" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_USED', 'FULLY_USED', 'EXPIRED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."cupo_letter_type" AS ENUM('TARIFF_RATE_QUOTA', 'NON_TARIFF_QUOTA', 'TRADE_AGREEMENT', 'SPECIAL_PROGRAM', 'SEASONAL');--> statement-breakpoint
CREATE TYPE "public"."customs_regime" AS ENUM('IMP_DEFINITIVA', 'EXP_DEFINITIVA', 'IMP_TEMPORAL', 'EXP_TEMPORAL', 'DEPOSITO_FISCAL', 'TRANSITO_INTERNO', 'TRANSITO_INTERNACIONAL', 'ELABORACION_TRANSFORMACION', 'REEXPEDICION', 'RETORNO', 'REGULARIZACION', 'CAMBIO_REGIMEN', 'EXTRACCION_DEPOSITO', 'VIRTUAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."entry_status" AS ENUM('DRAFT', 'PREVALIDATED', 'VALIDATED', 'PAID', 'DISPATCHED', 'RELEASED', 'CANCELLED', 'RECTIFIED');--> statement-breakpoint
CREATE TYPE "public"."tax_type" AS ENUM('IGI', 'IGE', 'IVA', 'IEPS', 'ISAN', 'DTA', 'PRV', 'CC', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."entry_party_role" AS ENUM('IMPORTER', 'EXPORTER', 'SELLER', 'BUYER', 'CUSTOMS_BROKER', 'CARRIER', 'CONSIGNEE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."inspection_result" AS ENUM('PENDING', 'PASSED', 'DISCREPANCY', 'SEIZED', 'PARTIAL_SEIZURE', 'SAMPLE_TAKEN');--> statement-breakpoint
CREATE TYPE "public"."inspection_type" AS ENUM('DOCUMENTAL', 'FISICO_ALEATORIO', 'FISICO_SELECTIVO', 'FISICO_TOTAL', 'RECONOCIMIENTO_ADUANERO');--> statement-breakpoint
CREATE TYPE "public"."semaphore_color" AS ENUM('GREEN', 'RED');--> statement-breakpoint
CREATE TYPE "public"."previo_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."previo_type" AS ENUM('FULL', 'PARTIAL', 'SAMPLING');--> statement-breakpoint
CREATE TYPE "public"."rectification_reason" AS ENUM('DATA_ERROR', 'TARIFF_FRACTION', 'VALUE_ADJUSTMENT', 'DESCRIPTION_CORRECTION', 'QUANTITY_ADJUSTMENT', 'REGIME_CHANGE', 'TAX_CORRECTION', 'PARTY_DATA', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."rectification_status" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."checklist_item_status" AS ENUM('REQUIRED', 'RECEIVED', 'VERIFIED', 'REJECTED', 'WAIVED', 'NOT_APPLICABLE');--> statement-breakpoint
CREATE TYPE "public"."checklist_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETE', 'WAIVED');--> statement-breakpoint
CREATE TYPE "public"."template_type" AS ENUM('PEDIMENTO', 'COVE', 'VALUATION', 'EXPENSE_ACCOUNT', 'INVOICE', 'POWER_OF_ATTORNEY', 'PACKING_LIST', 'COMMERCIAL_INVOICE', 'CERTIFICATE_OF_ORIGIN', 'BILL_OF_LADING', 'CUSTOMS_LETTER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."transmission_status" AS ENUM('PENDING', 'SENT', 'ACKNOWLEDGED', 'ACCEPTED', 'REJECTED', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."e_document_status" AS ENUM('DRAFT', 'VALIDATING', 'TRANSMITTED', 'ACCEPTED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."e_document_type" AS ENUM('COVE_IMPORT', 'COVE_EXPORT', 'EDOCUMENT_COMPLEMENT');--> statement-breakpoint
CREATE TYPE "public"."expense_account_status" AS ENUM('DRAFT', 'GENERATED', 'SENT_TO_CLIENT', 'APPROVED_BY_CLIENT', 'INVOICED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."movement_category" AS ENUM('CLIENT_ADVANCE', 'CLIENT_PAYMENT', 'REFUND_RECEIVED', 'CUSTOMS_DUTY_PAYMENT', 'FREIGHT_PAYMENT', 'STORAGE_PAYMENT', 'HANDLING_PAYMENT', 'PREVALIDATION_PAYMENT', 'SERVICE_PROVIDER_PAYMENT', 'GOVERNMENT_FEE', 'REFUND_ISSUED', 'INTERNAL_TRANSFER', 'BALANCE_ADJUSTMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."movement_status" AS ENUM('PENDING', 'CONFIRMED', 'RECONCILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."immex_operation_type" AS ENUM('IMPORT_TEMPORAL', 'EXPORT_VIRTUAL', 'TRANSFER', 'DEFINITIVE_CHANGE', 'RETURN');--> statement-breakpoint
CREATE TYPE "public"."immex_program_status" AS ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'IN_RENOVATION');--> statement-breakpoint
CREATE TYPE "public"."immex_program_type" AS ENUM('MANUFACTURERA', 'MAQUILADORA', 'SERVICIOS', 'ALBERGUE', 'CONTROLADORA');--> statement-breakpoint
CREATE TYPE "public"."exporter_registry_status" AS ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."importer_registry_status" AS ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."importer_registry_type" AS ENUM('GENERAL', 'SECTORIAL', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."invoice_item_category" AS ENUM('SERVICE_FEE', 'CUSTOMS_DUTY', 'TAX', 'DTA', 'PRV', 'FREIGHT', 'INSURANCE', 'STORAGE', 'HANDLING', 'DOCUMENTATION', 'GOVERNMENT_FEE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'CREDITED');--> statement-breakpoint
CREATE TYPE "public"."invoice_type" AS ENUM('SERVICE', 'REIMBURSEMENT', 'ADVANCE_REQUEST', 'CREDIT_NOTE');--> statement-breakpoint
CREATE TYPE "public"."kpi_period" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."legal_document_type" AS ENUM('LAW', 'REGULATION', 'DECREE', 'AGREEMENT', 'CIRCULAR', 'GENERAL_RULES', 'EXPLANATORY_NOTES', 'MANUAL', 'NOM', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('IN_APP', 'EMAIL', 'SMS', 'WEBHOOK');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('SYSTEM', 'OPERATION', 'DOCUMENT', 'BILLING', 'COMPLIANCE', 'SHIPMENT', 'CUPO', 'WAREHOUSE', 'ALERT', 'REMINDER');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD', 'ELECTRONIC_WALLET', 'COMPENSATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'CONFIRMED', 'REVERSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."report_execution_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."report_format" AS ENUM('TABLE', 'CHART', 'SUMMARY', 'PIVOT');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('OPERATIONS_SUMMARY', 'CUSTOMS_ENTRIES', 'SHIPMENTS', 'BILLING', 'EXPENSE_ACCOUNTS', 'TREASURY', 'INVENTORY', 'COMPLIANCE', 'CLIENTS', 'CUPO_USAGE', 'TARIFF_ANALYSIS', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('PENDING', 'IN_TRANSIT', 'AT_CUSTOMS', 'PREVIO', 'DISPATCHING', 'MODULATION', 'GREEN_LIGHT', 'RED_LIGHT', 'INSPECTION', 'RELEASED', 'DELIVERED', 'HELD', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."shipment_type" AS ENUM('IMPORT', 'EXPORT', 'TRANSIT');--> statement-breakpoint
CREATE TYPE "public"."announcement_level" AS ENUM('INFO', 'WARNING', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."measurement_unit" AS ENUM('KG', 'L', 'M', 'M2', 'M3', 'PZ', 'PAR', 'JGO', 'GR', 'KWH', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."regulation_type" AS ENUM('NOM', 'PRIOR_PERMIT', 'PHYTOSANITARY', 'ZOOSANITARY', 'ENVIRONMENTAL', 'ENERGY', 'SAFETY', 'LABELING', 'QUOTA', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."trade_flow" AS ENUM('IMPORT', 'EXPORT', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."cost_category" AS ENUM('INCREMENTABLE', 'NON_INCREMENTABLE');--> statement-breakpoint
CREATE TYPE "public"."cost_type" AS ENUM('FREIGHT', 'INSURANCE', 'LOADING_UNLOADING', 'HANDLING', 'PACKING', 'COMMISSIONS', 'ROYALTIES', 'ASSISTS', 'SUBSEQUENT_PROCEEDS', 'OTHER_INCREMENTABLE', 'INLAND_FREIGHT_MX', 'CUSTOMS_DUTIES', 'ASSEMBLY_MX', 'TECHNICAL_ASSISTANCE', 'BUYING_COMMISSIONS', 'INTEREST', 'OTHER_NON_INCREMENTABLE');--> statement-breakpoint
CREATE TYPE "public"."valuation_method" AS ENUM('TRANSACTION_VALUE', 'IDENTICAL_GOODS', 'SIMILAR_GOODS', 'DEDUCTIVE_VALUE', 'COMPUTED_VALUE', 'FALLBACK');--> statement-breakpoint
CREATE TYPE "public"."valuation_status" AS ENUM('DRAFT', 'COMPLETED', 'SUBMITTED', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."warehouse_inventory_status" AS ENUM('IN_STOCK', 'RESERVED', 'IN_TRANSIT', 'PENDING_INSPECTION', 'HELD_BY_CUSTOMS', 'RELEASED', 'DAMAGED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."warehouse_movement_direction" AS ENUM('INBOUND', 'OUTBOUND', 'INTERNAL_TRANSFER', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."warehouse_movement_status" AS ENUM('PENDING', 'IN_PROCESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."warehouse_zone_type" AS ENUM('RECEIVING', 'STORAGE', 'PICKING', 'SHIPPING', 'INSPECTION', 'QUARANTINE', 'HAZMAT', 'COLD_STORAGE', 'RETURNS');--> statement-breakpoint
CREATE TYPE "public"."warehouse_type" AS ENUM('BONDED', 'STRATEGIC_BONDED', 'GENERAL', 'PRIVATE', 'TEMPORARY', 'CROSS_DOCK');--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'TRIALING' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'PAST_DUE' BEFORE 'CANCELLED';--> statement-breakpoint
CREATE TABLE "anexo22_container_types" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"size_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_container_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_countries" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"iso_alpha2" text,
	"iso_alpha3" text,
	"region" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_currencies" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text,
	"country" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_customs_regimes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"operation_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_customs_regimes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_customs_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"section_code" text,
	"section_name" text,
	"city" text,
	"state" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_customs_sections_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_identifiers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"level" text,
	"complement" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_identifiers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_operation_types" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_operation_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_payment_methods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_pedimento_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"operation_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_pedimento_keys_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_rrna" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"issuing_authority" text,
	"regulation_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_rrna_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_taxes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"abbreviation" text,
	"tax_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_taxes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_transport_means" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_transport_means_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "anexo22_units_of_measure" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"abbreviation" text,
	"unit_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anexo22_units_of_measure_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" "bank_account_type" NOT NULL,
	"bank_name" text NOT NULL,
	"account_name" text NOT NULL,
	"account_number" text,
	"clabe" text,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"current_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"observations" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"cover_image_url" text,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"reading_time_minutes" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "client_account_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"type" "account_movement_type" NOT NULL,
	"amount" numeric(16, 2) NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
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
	"is_reconciled" boolean DEFAULT false NOT NULL,
	"reconciled_at" timestamp with time zone,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_account_statements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"statement_number" text NOT NULL,
	"status" "account_statement_status" DEFAULT 'DRAFT' NOT NULL,
	"period_from" date NOT NULL,
	"period_to" date NOT NULL,
	"opening_balance" numeric(16, 2) NOT NULL,
	"total_credits" numeric(16, 2) NOT NULL,
	"total_debits" numeric(16, 2) NOT NULL,
	"closing_balance" numeric(16, 2) NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"movement_count" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"sent_at" timestamp with time zone,
	"sent_to_email" text,
	"acknowledged_at" timestamp with time zone,
	"file_key" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_funds" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"available_balance" numeric(16, 2) DEFAULT '0' NOT NULL,
	"reserved_balance" numeric(16, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"minimum_fund_alert" numeric(16, 2),
	"alert_sent" boolean DEFAULT false NOT NULL,
	"last_movement_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"total_advances" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_charges" numeric(18, 2) DEFAULT '0' NOT NULL,
	"current_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_client_balance_org_client_currency" UNIQUE("organization_id","client_id","currency")
);
--> statement-breakpoint
CREATE TABLE "cupo_letter_usages" (
	"id" text PRIMARY KEY NOT NULL,
	"cupo_letter_id" text NOT NULL,
	"entry_id" text,
	"pedimento_number" text,
	"shipment_id" text,
	"quantity_used" numeric(18, 4) NOT NULL,
	"unit_of_measure" text NOT NULL,
	"usage_date" timestamp with time zone DEFAULT now() NOT NULL,
	"observations" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cupo_letters" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" "cupo_letter_type" NOT NULL,
	"status" "cupo_letter_status" DEFAULT 'DRAFT' NOT NULL,
	"letter_number" text,
	"folio" text,
	"client_id" text,
	"importer_rfc" text,
	"importer_name" text,
	"tariff_fraction" text,
	"product_description" text NOT NULL,
	"country_of_origin" text,
	"trade_agreement" text,
	"authorized_quantity" numeric(18, 4) NOT NULL,
	"used_quantity" numeric(18, 4) DEFAULT '0' NOT NULL,
	"remaining_quantity" numeric(18, 4) DEFAULT '0' NOT NULL,
	"unit_of_measure" text NOT NULL,
	"preferential_tariff_rate" numeric(8, 4),
	"normal_tariff_rate" numeric(8, 4),
	"issuing_authority" text,
	"issue_date" timestamp with time zone,
	"effective_date" timestamp with time zone,
	"expiration_date" timestamp with time zone,
	"se_reference_number" text,
	"observations" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"customs_office_id" text NOT NULL,
	"patent_id" text NOT NULL,
	"entry_number" text,
	"entry_key" text NOT NULL,
	"regime" "customs_regime" NOT NULL,
	"status" "entry_status" DEFAULT 'DRAFT' NOT NULL,
	"operation_type" integer NOT NULL,
	"entry_date" date,
	"payment_date" date,
	"arrival_date" date,
	"transport_mode" integer,
	"carrier_name" text,
	"transport_document_number" text,
	"origin_country" text,
	"destination_country" text,
	"exchange_rate" numeric(12, 4),
	"invoice_currency" text,
	"total_commercial_value_usd" numeric(16, 2),
	"total_commercial_value_mxn" numeric(16, 2),
	"total_customs_value_mxn" numeric(16, 2),
	"total_duties" numeric(16, 2),
	"total_vat" numeric(16, 2),
	"total_dta" numeric(16, 2),
	"total_other_taxes" numeric(16, 2),
	"grand_total" numeric(16, 2),
	"prevalidation_result" jsonb,
	"payment_reference" text,
	"gross_weight_kg" numeric(16, 4),
	"package_count" integer,
	"package_marks" text,
	"freight_value" numeric(16, 2),
	"insurance_value" numeric(16, 2),
	"packaging_value" numeric(16, 2),
	"other_incrementables" numeric(16, 2),
	"incoterm" text,
	"vinculacion" text,
	"value_receipt_number" text,
	"payment_method" text,
	"acceptance_code" text,
	"customs_section_key" text,
	"exit_date" date,
	"internal_reference" text,
	"observations" text,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_entry_containers" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"number" text NOT NULL,
	"container_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_entry_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"document_type_code" text NOT NULL,
	"document_type_name" text NOT NULL,
	"document_number" text,
	"document_date" text,
	"issued_by" text,
	"storage_key" text,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_entry_identifiers" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"item_id" text,
	"level" text NOT NULL,
	"code" text NOT NULL,
	"complement1" text,
	"complement2" text,
	"complement3" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_entry_item_taxes" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"type" "tax_type" NOT NULL,
	"rate" numeric(8, 4) NOT NULL,
	"base_amount" numeric(16, 2) NOT NULL,
	"amount" numeric(16, 2) NOT NULL,
	"payment_form" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_entry_items" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"item_number" integer NOT NULL,
	"tariff_fraction_id" text NOT NULL,
	"tariff_fraction_code" text NOT NULL,
	"tariff_subdivision" text,
	"valuation_method" integer,
	"description" text NOT NULL,
	"origin_country" text NOT NULL,
	"quantity" numeric(16, 4) NOT NULL,
	"measurement_unit" text NOT NULL,
	"commercial_quantity" numeric(16, 4),
	"commercial_unit_of_measure" text,
	"gross_weight_kg" numeric(16, 4),
	"net_weight_kg" numeric(16, 4),
	"commercial_value_currency" numeric(16, 2) NOT NULL,
	"commercial_value_usd" numeric(16, 2) NOT NULL,
	"paid_price_usd" numeric(16, 4),
	"unit_price_usd" numeric(16, 4),
	"customs_value_mxn" numeric(16, 2) NOT NULL,
	"customs_value_usd" numeric(16, 2),
	"incrementables_mxn" numeric(16, 2),
	"added_value_mxn" numeric(16, 2),
	"trade_agreement_code" text,
	"vinculacion" text,
	"brand" text,
	"model" text,
	"serial_number" text,
	"product_code" text,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_entry_parties" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"role" "entry_party_role" NOT NULL,
	"tax_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"country" text,
	"curp" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_entry_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"previous_status" "entry_status",
	"new_status" "entry_status" NOT NULL,
	"changed_by_id" text NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_inspection_items" (
	"id" text PRIMARY KEY NOT NULL,
	"inspection_id" text NOT NULL,
	"entry_item_id" text,
	"declared_quantity" numeric(16, 4),
	"found_quantity" numeric(16, 4),
	"declared_tariff_fraction" text,
	"found_tariff_fraction" text,
	"description" text,
	"discrepancy_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_inspections" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"entry_id" text NOT NULL,
	"shipment_id" text,
	"semaphore_color" "semaphore_color",
	"modulation_date" timestamp with time zone,
	"inspection_type" "inspection_type",
	"inspection_result" "inspection_result" DEFAULT 'PENDING' NOT NULL,
	"inspector_name" text,
	"inspector_badge" text,
	"inspection_location" text,
	"scheduled_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"packages_inspected" integer,
	"discrepancies_found" boolean DEFAULT false,
	"discrepancy_description" text,
	"penalty_amount" numeric(16, 2),
	"penalty_currency" text,
	"samples_taken" integer DEFAULT 0,
	"sample_description" text,
	"acta_number" text,
	"acta_filed_at" timestamp with time zone,
	"internal_notes" text,
	"metadata" jsonb,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_offices" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customs_offices_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "customs_patents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"patent_number" text NOT NULL,
	"broker_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_org_patent" UNIQUE("organization_id","patent_number")
);
--> statement-breakpoint
CREATE TABLE "customs_previo_items" (
	"id" text PRIMARY KEY NOT NULL,
	"previo_id" text NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_previos" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"entry_id" text,
	"shipment_id" text,
	"previo_number" text NOT NULL,
	"type" "previo_type" DEFAULT 'FULL' NOT NULL,
	"status" "previo_status" DEFAULT 'PENDING' NOT NULL,
	"warehouse_name" text,
	"warehouse_address" text,
	"customs_office_id" text,
	"scheduled_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_rectifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"original_entry_id" text NOT NULL,
	"rectification_entry_id" text,
	"sequence_number" integer DEFAULT 1 NOT NULL,
	"status" "rectification_status" DEFAULT 'DRAFT' NOT NULL,
	"reason" "rectification_reason" NOT NULL,
	"reason_description" text NOT NULL,
	"modified_fields" jsonb,
	"filed_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"sat_acknowledgment_number" text,
	"sat_rejection_reason" text,
	"internal_notes" text,
	"metadata" jsonb,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rectification_field_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"rectification_id" text NOT NULL,
	"field_path" text NOT NULL,
	"field_label" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_checklist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"checklist_id" text NOT NULL,
	"item_number" integer NOT NULL,
	"document_name" text NOT NULL,
	"description" text,
	"status" "checklist_item_status" DEFAULT 'REQUIRED' NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"document_id" text,
	"verified_by_id" text,
	"verified_at" timestamp with time zone,
	"rejection_reason" text,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_checklists" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"status" "checklist_status" DEFAULT 'PENDING' NOT NULL,
	"name" text NOT NULL,
	"shipment_id" text,
	"entry_id" text,
	"client_id" text,
	"total_items" integer DEFAULT 0 NOT NULL,
	"completed_items" integer DEFAULT 0 NOT NULL,
	"observations" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"parent_folder_id" text,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"description" text,
	"shipment_id" text,
	"entry_id" text,
	"client_id" text,
	"document_count" integer DEFAULT 0 NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" "template_type" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"variables_schema" text,
	"storage_key" text,
	"mime_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "e_document_items" (
	"id" text PRIMARY KEY NOT NULL,
	"e_document_id" text NOT NULL,
	"item_number" integer NOT NULL,
	"description" text NOT NULL,
	"tariff_fraction_code" text,
	"brand" text,
	"model" text,
	"origin_country" text,
	"quantity" numeric(16, 4) NOT NULL,
	"measurement_unit" text NOT NULL,
	"unit_price" numeric(16, 4) NOT NULL,
	"total_value" numeric(16, 2) NOT NULL,
	"specific_identifier" text,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "e_document_transmissions" (
	"id" text PRIMARY KEY NOT NULL,
	"e_document_id" text NOT NULL,
	"status" "transmission_status" DEFAULT 'PENDING' NOT NULL,
	"transaction_id" text,
	"request_payload" text,
	"response_payload" text,
	"response_code" text,
	"response_message" text,
	"sent_at" timestamp with time zone,
	"responded_at" timestamp with time zone,
	"triggered_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "e_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"entry_id" text,
	"type" "e_document_type" NOT NULL,
	"status" "e_document_status" DEFAULT 'DRAFT' NOT NULL,
	"cove_number" text,
	"document_number" text,
	"document_date" date,
	"seller_name" text NOT NULL,
	"seller_tax_id" text,
	"seller_address" text,
	"seller_country" text,
	"buyer_name" text NOT NULL,
	"buyer_tax_id" text,
	"buyer_address" text,
	"buyer_country" text,
	"invoice_number" text,
	"invoice_date" date,
	"invoice_currency" text,
	"total_invoice_value" numeric(16, 2),
	"total_items" text,
	"is_subdivided" boolean DEFAULT false NOT NULL,
	"parent_e_document_id" text,
	"observations" text,
	"transmitted_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"sat_response" text,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_account_items" (
	"id" text PRIMARY KEY NOT NULL,
	"expense_account_id" text NOT NULL,
	"item_number" integer NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"receipt_number" text,
	"receipt_date" date,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"exchange_rate" numeric(12, 4),
	"amount_mxn" numeric(18, 2) NOT NULL,
	"tax_amount" numeric(18, 2),
	"operation_charge_id" text,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"status" "expense_account_status" DEFAULT 'DRAFT' NOT NULL,
	"account_number" text,
	"shipment_id" text,
	"entry_id" text,
	"period_from" date,
	"period_to" date,
	"generated_date" date,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"total_charges" numeric(18, 2) NOT NULL,
	"total_advances" numeric(18, 2) NOT NULL,
	"balance_due" numeric(18, 2) NOT NULL,
	"invoice_id" text,
	"observations" text,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" "movement_type" NOT NULL,
	"category" "movement_category" NOT NULL,
	"status" "movement_status" DEFAULT 'PENDING' NOT NULL,
	"bank_account_id" text NOT NULL,
	"destination_account_id" text,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"exchange_rate" numeric(12, 4),
	"amount_mxn" numeric(18, 2) NOT NULL,
	"reference_number" text,
	"description" text NOT NULL,
	"movement_date" date NOT NULL,
	"client_id" text,
	"invoice_id" text,
	"payment_id" text,
	"shipment_id" text,
	"entry_id" text,
	"balance_after" numeric(18, 2),
	"reconciled_at" timestamp with time zone,
	"reconciled_by_id" text,
	"observations" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "immex_authorized_products" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"tariff_fraction" text NOT NULL,
	"description" text NOT NULL,
	"unit_of_measure" text,
	"authorized_quantity" numeric(16, 4),
	"authorized_value_usd" numeric(16, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "immex_machinery" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"tariff_fraction" text NOT NULL,
	"description" text NOT NULL,
	"brand" text,
	"model" text,
	"serial_number" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"entry_number" text,
	"import_date" date,
	"return_deadline" date,
	"returned_date" date,
	"is_returned" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "immex_programs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"program_number" text NOT NULL,
	"program_type" "immex_program_type" NOT NULL,
	"status" "immex_program_status" DEFAULT 'ACTIVE' NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "immex_virtual_operations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"operation_type" "immex_operation_type" NOT NULL,
	"sender_program_id" text,
	"sender_rfc" text NOT NULL,
	"sender_business_name" text NOT NULL,
	"receiver_program_id" text,
	"receiver_rfc" text NOT NULL,
	"receiver_business_name" text NOT NULL,
	"virtual_pedimento_number" text,
	"complementary_pedimento_number" text,
	"operation_date" date NOT NULL,
	"total_value_usd" numeric(16, 2),
	"internal_notes" text,
	"metadata" jsonb,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exporter_registry" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"status" "exporter_registry_status" DEFAULT 'ACTIVE' NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "importer_registry" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"registry_type" "importer_registry_type" DEFAULT 'GENERAL' NOT NULL,
	"status" "importer_registry_status" DEFAULT 'ACTIVE' NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "importer_registry_sectors" (
	"id" text PRIMARY KEY NOT NULL,
	"registry_id" text NOT NULL,
	"sector_code" text NOT NULL,
	"sector_name" text NOT NULL,
	"inscription_date" date,
	"expiration_date" date,
	"status" "importer_registry_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"item_number" integer NOT NULL,
	"category" "invoice_item_category" NOT NULL,
	"sat_product_code" text,
	"description" text NOT NULL,
	"measurement_unit" text DEFAULT 'E48' NOT NULL,
	"quantity" numeric(16, 4) DEFAULT '1' NOT NULL,
	"unit_price" numeric(18, 4) NOT NULL,
	"subtotal" numeric(18, 2) NOT NULL,
	"tax_rate" numeric(6, 4),
	"tax_amount" numeric(18, 2),
	"total" numeric(18, 2) NOT NULL,
	"operation_charge_id" text,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"type" "invoice_type" NOT NULL,
	"status" "invoice_status" DEFAULT 'DRAFT' NOT NULL,
	"invoice_number" text,
	"invoice_series" text,
	"cfdi_uuid" text,
	"issue_date" date,
	"due_date" date,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"exchange_rate" numeric(12, 4),
	"subtotal" numeric(18, 2) NOT NULL,
	"tax_amount" numeric(18, 2) NOT NULL,
	"total_amount" numeric(18, 2) NOT NULL,
	"paid_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"balance_due" numeric(18, 2) NOT NULL,
	"cfdi_usage" text,
	"payment_method" text,
	"payment_form" text,
	"shipment_id" text,
	"entry_id" text,
	"credit_note_id" text,
	"total_items" integer,
	"observations" text,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpi_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"metric_name" text NOT NULL,
	"period" "kpi_period" NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"value" numeric(18, 4) NOT NULL,
	"previous_value" numeric(18, 4),
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "legal_document_type" NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"issuing_authority" text,
	"publication_date" date,
	"effective_date" date,
	"source_url" text,
	"summary" text,
	"content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"notification_type" text NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"webhook_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" DEFAULT 'IN_APP' NOT NULL,
	"priority" "notification_priority" DEFAULT 'NORMAL' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"action_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"is_sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp with time zone,
	"metadata" text,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"method" "payment_method_type" NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"exchange_rate" numeric(12, 4),
	"reference" text,
	"bank_name" text,
	"account_number" text,
	"payment_date" date NOT NULL,
	"confirmed_at" timestamp with time zone,
	"notes" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text,
	"organization_id" text,
	"session_id" text,
	"category" text NOT NULL,
	"event_name" text NOT NULL,
	"properties" jsonb,
	"source" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"page_url" text,
	"numeric_value" integer,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "report_executions" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"status" "report_execution_status" DEFAULT 'PENDING' NOT NULL,
	"filters_applied" text,
	"result_data" text,
	"row_count" integer,
	"execution_time_ms" integer,
	"error_message" text,
	"export_storage_key" text,
	"export_format" text,
	"executed_by_id" text NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saai_error_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"registro" integer NOT NULL,
	"campo" integer NOT NULL,
	"tipo" integer NOT NULL,
	"numero" integer NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saai_registro_types" (
	"id" text PRIMARY KEY NOT NULL,
	"code" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saai_registro_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "saved_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" "report_type" NOT NULL,
	"format" "report_format" DEFAULT 'TABLE' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"query_config" text NOT NULL,
	"filters_config" text,
	"columns_config" text,
	"chart_config" text,
	"is_shared" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"shipment_id" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"content" text NOT NULL,
	"visible_to_client" text DEFAULT 'false' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"shipment_id" text NOT NULL,
	"entry_id" text NOT NULL,
	"relationship" text DEFAULT 'PRIMARY' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_shipment_entry" UNIQUE("shipment_id","entry_id")
);
--> statement-breakpoint
CREATE TABLE "shipment_stages" (
	"id" text PRIMARY KEY NOT NULL,
	"shipment_id" text NOT NULL,
	"stage_name" text NOT NULL,
	"stage_label" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"location" text,
	"performed_by_id" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"primary_entry_id" text,
	"type" "shipment_type" NOT NULL,
	"status" "shipment_status" DEFAULT 'PENDING' NOT NULL,
	"tracking_number" text NOT NULL,
	"client_reference" text,
	"client_name" text,
	"client_tax_id" text,
	"goods_description" text,
	"origin_country" text,
	"origin_city" text,
	"destination_country" text,
	"destination_city" text,
	"transport_mode" integer,
	"carrier_name" text,
	"vessel_name" text,
	"voyage_number" text,
	"bill_of_lading" text,
	"container_numbers" text,
	"total_packages" integer,
	"total_gross_weight_kg" numeric(16, 4),
	"total_net_weight_kg" numeric(16, 4),
	"declared_value_usd" numeric(16, 2),
	"estimated_arrival_date" date,
	"actual_arrival_date" date,
	"release_date" date,
	"delivery_date" date,
	"customs_office_id" text,
	"metadata" jsonb,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_processed_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_admins" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "system_announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"level" "announcement_level" DEFAULT 'INFO' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tariff_agreement_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"fraction_id" text NOT NULL,
	"agreement_id" text NOT NULL,
	"preferential_rate" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_fraction_agreement" UNIQUE("fraction_id","agreement_id")
);
--> statement-breakpoint
CREATE TABLE "tariff_chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"code" text NOT NULL,
	"sort_order" integer NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tariff_chapters_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tariff_fractions" (
	"id" text PRIMARY KEY NOT NULL,
	"subheading_id" text NOT NULL,
	"code" text NOT NULL,
	"sort_order" integer NOT NULL,
	"description" text NOT NULL,
	"measurement_unit" "measurement_unit" NOT NULL,
	"import_tariff_rate" text NOT NULL,
	"export_tariff_rate" text NOT NULL,
	"vat_rate" numeric(5, 2),
	"ieps_rate" numeric(5, 2),
	"isan_applies" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tariff_fractions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tariff_headings" (
	"id" text PRIMARY KEY NOT NULL,
	"chapter_id" text NOT NULL,
	"code" text NOT NULL,
	"sort_order" integer NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tariff_headings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tariff_regulations" (
	"id" text PRIMARY KEY NOT NULL,
	"fraction_id" text NOT NULL,
	"type" "regulation_type" NOT NULL,
	"trade_flow" "trade_flow" NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"issuing_authority" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tariff_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"sort_order" integer NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tariff_sections_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tariff_subheadings" (
	"id" text PRIMARY KEY NOT NULL,
	"heading_id" text NOT NULL,
	"code" text NOT NULL,
	"sort_order" integer NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tariff_subheadings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "trade_agreements" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"partner_countries" text NOT NULL,
	"effective_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trade_agreements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "valuation_costs" (
	"id" text PRIMARY KEY NOT NULL,
	"declaration_id" text NOT NULL,
	"category" "cost_category" NOT NULL,
	"type" "cost_type" NOT NULL,
	"description" text NOT NULL,
	"amount_currency" numeric(16, 2),
	"currency" text,
	"amount_mxn" numeric(16, 2) NOT NULL,
	"proration_method" text,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_declarations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"entry_id" text,
	"status" "valuation_status" DEFAULT 'DRAFT' NOT NULL,
	"valuation_method" "valuation_method" DEFAULT 'TRANSACTION_VALUE' NOT NULL,
	"declaration_number" text,
	"declaration_date" date,
	"customs_office_name" text,
	"supplier_name" text NOT NULL,
	"supplier_tax_id" text,
	"supplier_address" text,
	"supplier_country" text,
	"buyer_name" text NOT NULL,
	"buyer_tax_id" text,
	"buyer_address" text,
	"invoice_number" text,
	"invoice_date" date,
	"invoice_currency" text,
	"exchange_rate" numeric(12, 4),
	"total_invoice_value" numeric(16, 2),
	"total_invoice_value_mxn" numeric(16, 2),
	"total_incrementables" numeric(16, 2),
	"total_non_incrementables" numeric(16, 2),
	"total_customs_value" numeric(16, 2),
	"incoterm" text,
	"total_items" integer,
	"observations" text,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_items" (
	"id" text PRIMARY KEY NOT NULL,
	"declaration_id" text NOT NULL,
	"item_number" integer NOT NULL,
	"description" text NOT NULL,
	"tariff_fraction_code" text,
	"brand" text,
	"model" text,
	"origin_country" text,
	"quantity" numeric(16, 4) NOT NULL,
	"measurement_unit" text NOT NULL,
	"unit_price" numeric(16, 4) NOT NULL,
	"total_value" numeric(16, 2) NOT NULL,
	"total_value_mxn" numeric(16, 2) NOT NULL,
	"incrementables_mxn" numeric(16, 2),
	"non_incrementables_mxn" numeric(16, 2),
	"customs_value_mxn" numeric(16, 2) NOT NULL,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"warehouse_id" text NOT NULL,
	"zone_id" text,
	"entry_id" text,
	"shipment_id" text,
	"client_id" text,
	"sku" text,
	"product_description" text NOT NULL,
	"tariff_fraction" text,
	"lot_number" text,
	"serial_number" text,
	"quantity" numeric(14, 4) NOT NULL,
	"unit_of_measure" text NOT NULL,
	"weight_kg" numeric(14, 4),
	"volume_m3" numeric(14, 4),
	"declared_value_usd" numeric(18, 2),
	"country_of_origin" text,
	"status" "warehouse_inventory_status" DEFAULT 'IN_STOCK' NOT NULL,
	"pedimento_number" text,
	"entry_date" timestamp with time zone,
	"expiration_date" timestamp with time zone,
	"max_storage_days" integer,
	"observations" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"warehouse_id" text NOT NULL,
	"inventory_item_id" text,
	"direction" "warehouse_movement_direction" NOT NULL,
	"status" "warehouse_movement_status" DEFAULT 'PENDING' NOT NULL,
	"reference_number" text,
	"entry_id" text,
	"shipment_id" text,
	"client_id" text,
	"product_description" text NOT NULL,
	"quantity" numeric(14, 4) NOT NULL,
	"unit_of_measure" text NOT NULL,
	"weight_kg" numeric(14, 4),
	"from_zone_id" text,
	"to_zone_id" text,
	"carrier_name" text,
	"vehicle_plate" text,
	"driver_name" text,
	"seal_number" text,
	"pedimento_number" text,
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completed_by_id" text,
	"observations" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_zones" (
	"id" text PRIMARY KEY NOT NULL,
	"warehouse_id" text NOT NULL,
	"type" "warehouse_zone_type" NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"capacity_units" numeric(12, 2),
	"capacity_unit_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" "warehouse_type" NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text DEFAULT 'MX',
	"contact_name" text,
	"contact_phone" text,
	"contact_email" text,
	"sat_authorization_number" text,
	"bonded_warehouse_license" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"observations" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "billing_interval" text DEFAULT 'month';--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "current_period_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "grace_period_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "stripe_price_id_monthly" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "stripe_price_id_yearly" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "price_monthly" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "price_yearly" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "trial_days" integer DEFAULT 14 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_account_movements" ADD CONSTRAINT "client_account_movements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_account_movements" ADD CONSTRAINT "client_account_movements_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_account_statements" ADD CONSTRAINT "client_account_statements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_account_statements" ADD CONSTRAINT "client_account_statements_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_funds" ADD CONSTRAINT "client_funds_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_funds" ADD CONSTRAINT "client_funds_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_balances" ADD CONSTRAINT "client_balances_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_balances" ADD CONSTRAINT "client_balances_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupo_letter_usages" ADD CONSTRAINT "cupo_letter_usages_cupo_letter_id_cupo_letters_id_fk" FOREIGN KEY ("cupo_letter_id") REFERENCES "public"."cupo_letters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupo_letters" ADD CONSTRAINT "cupo_letters_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entries" ADD CONSTRAINT "customs_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entries" ADD CONSTRAINT "customs_entries_customs_office_id_customs_offices_id_fk" FOREIGN KEY ("customs_office_id") REFERENCES "public"."customs_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entries" ADD CONSTRAINT "customs_entries_patent_id_customs_patents_id_fk" FOREIGN KEY ("patent_id") REFERENCES "public"."customs_patents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_containers" ADD CONSTRAINT "customs_entry_containers_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_documents" ADD CONSTRAINT "customs_entry_documents_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_identifiers" ADD CONSTRAINT "customs_entry_identifiers_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_identifiers" ADD CONSTRAINT "customs_entry_identifiers_item_id_customs_entry_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."customs_entry_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_item_taxes" ADD CONSTRAINT "customs_entry_item_taxes_item_id_customs_entry_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."customs_entry_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_items" ADD CONSTRAINT "customs_entry_items_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_items" ADD CONSTRAINT "customs_entry_items_tariff_fraction_id_tariff_fractions_id_fk" FOREIGN KEY ("tariff_fraction_id") REFERENCES "public"."tariff_fractions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_parties" ADD CONSTRAINT "customs_entry_parties_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_entry_status_history" ADD CONSTRAINT "customs_entry_status_history_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_inspection_items" ADD CONSTRAINT "customs_inspection_items_inspection_id_customs_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."customs_inspections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_inspections" ADD CONSTRAINT "customs_inspections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_inspections" ADD CONSTRAINT "customs_inspections_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_inspections" ADD CONSTRAINT "customs_inspections_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_patents" ADD CONSTRAINT "customs_patents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_previo_items" ADD CONSTRAINT "customs_previo_items_previo_id_customs_previos_id_fk" FOREIGN KEY ("previo_id") REFERENCES "public"."customs_previos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_previos" ADD CONSTRAINT "customs_previos_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_previos" ADD CONSTRAINT "customs_previos_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_previos" ADD CONSTRAINT "customs_previos_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_rectifications" ADD CONSTRAINT "customs_rectifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_rectifications" ADD CONSTRAINT "customs_rectifications_original_entry_id_customs_entries_id_fk" FOREIGN KEY ("original_entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customs_rectifications" ADD CONSTRAINT "customs_rectifications_rectification_entry_id_customs_entries_id_fk" FOREIGN KEY ("rectification_entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rectification_field_changes" ADD CONSTRAINT "rectification_field_changes_rectification_id_customs_rectifications_id_fk" FOREIGN KEY ("rectification_id") REFERENCES "public"."customs_rectifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_checklist_items" ADD CONSTRAINT "document_checklist_items_checklist_id_document_checklists_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."document_checklists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_checklists" ADD CONSTRAINT "document_checklists_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_document_items" ADD CONSTRAINT "e_document_items_e_document_id_e_documents_id_fk" FOREIGN KEY ("e_document_id") REFERENCES "public"."e_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_document_transmissions" ADD CONSTRAINT "e_document_transmissions_e_document_id_e_documents_id_fk" FOREIGN KEY ("e_document_id") REFERENCES "public"."e_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_documents" ADD CONSTRAINT "e_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e_documents" ADD CONSTRAINT "e_documents_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_account_items" ADD CONSTRAINT "expense_account_items_expense_account_id_expense_accounts_id_fk" FOREIGN KEY ("expense_account_id") REFERENCES "public"."expense_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_accounts" ADD CONSTRAINT "expense_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_accounts" ADD CONSTRAINT "expense_accounts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_movements" ADD CONSTRAINT "fund_movements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_movements" ADD CONSTRAINT "fund_movements_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_movements" ADD CONSTRAINT "fund_movements_destination_account_id_bank_accounts_id_fk" FOREIGN KEY ("destination_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immex_authorized_products" ADD CONSTRAINT "immex_authorized_products_program_id_immex_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."immex_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immex_machinery" ADD CONSTRAINT "immex_machinery_program_id_immex_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."immex_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immex_programs" ADD CONSTRAINT "immex_programs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immex_programs" ADD CONSTRAINT "immex_programs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immex_virtual_operations" ADD CONSTRAINT "immex_virtual_operations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immex_virtual_operations" ADD CONSTRAINT "immex_virtual_operations_sender_program_id_immex_programs_id_fk" FOREIGN KEY ("sender_program_id") REFERENCES "public"."immex_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immex_virtual_operations" ADD CONSTRAINT "immex_virtual_operations_receiver_program_id_immex_programs_id_fk" FOREIGN KEY ("receiver_program_id") REFERENCES "public"."immex_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exporter_registry" ADD CONSTRAINT "exporter_registry_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exporter_registry" ADD CONSTRAINT "exporter_registry_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "importer_registry" ADD CONSTRAINT "importer_registry_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "importer_registry" ADD CONSTRAINT "importer_registry_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "importer_registry_sectors" ADD CONSTRAINT "importer_registry_sectors_registry_id_importer_registry_id_fk" FOREIGN KEY ("registry_id") REFERENCES "public"."importer_registry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_snapshots" ADD CONSTRAINT "kpi_snapshots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_report_id_saved_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."saved_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_comments" ADD CONSTRAINT "shipment_comments_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_entries" ADD CONSTRAINT "shipment_entries_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_entries" ADD CONSTRAINT "shipment_entries_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_stages" ADD CONSTRAINT "shipment_stages_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_primary_entry_id_customs_entries_id_fk" FOREIGN KEY ("primary_entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariff_agreement_preferences" ADD CONSTRAINT "tariff_agreement_preferences_fraction_id_tariff_fractions_id_fk" FOREIGN KEY ("fraction_id") REFERENCES "public"."tariff_fractions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariff_agreement_preferences" ADD CONSTRAINT "tariff_agreement_preferences_agreement_id_trade_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."trade_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariff_chapters" ADD CONSTRAINT "tariff_chapters_section_id_tariff_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."tariff_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariff_fractions" ADD CONSTRAINT "tariff_fractions_subheading_id_tariff_subheadings_id_fk" FOREIGN KEY ("subheading_id") REFERENCES "public"."tariff_subheadings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariff_headings" ADD CONSTRAINT "tariff_headings_chapter_id_tariff_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."tariff_chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariff_regulations" ADD CONSTRAINT "tariff_regulations_fraction_id_tariff_fractions_id_fk" FOREIGN KEY ("fraction_id") REFERENCES "public"."tariff_fractions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariff_subheadings" ADD CONSTRAINT "tariff_subheadings_heading_id_tariff_headings_id_fk" FOREIGN KEY ("heading_id") REFERENCES "public"."tariff_headings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_costs" ADD CONSTRAINT "valuation_costs_declaration_id_valuation_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."valuation_declarations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_declarations" ADD CONSTRAINT "valuation_declarations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_declarations" ADD CONSTRAINT "valuation_declarations_entry_id_customs_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."customs_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_items" ADD CONSTRAINT "valuation_items_declaration_id_valuation_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."valuation_declarations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_zone_id_warehouse_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."warehouse_zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_movements" ADD CONSTRAINT "warehouse_movements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_movements" ADD CONSTRAINT "warehouse_movements_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_movements" ADD CONSTRAINT "warehouse_movements_inventory_item_id_warehouse_inventory_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."warehouse_inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_zones" ADD CONSTRAINT "warehouse_zones_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_product_events_org_occurred" ON "product_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_product_events_user_occurred" ON "product_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_product_events_name_occurred" ON "product_events" USING btree ("event_name","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_product_events_session" ON "product_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_product_events_category" ON "product_events" USING btree ("category","occurred_at");--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_stripe_customer_id_unique" UNIQUE("stripe_customer_id");