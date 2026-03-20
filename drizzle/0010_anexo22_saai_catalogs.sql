-- Anexo 22 reference catalogs (catálogos oficiales SAT)
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_customs_sections" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "section_code" text,
  "section_name" text,
  "city" text,
  "state" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_transport_means" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_pedimento_keys" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "operation_type" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_customs_regimes" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "operation_type" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_units_of_measure" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "abbreviation" text,
  "unit_type" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_countries" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "iso_alpha2" text,
  "iso_alpha3" text,
  "region" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_currencies" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "symbol" text,
  "country" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_taxes" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "abbreviation" text,
  "tax_type" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_identifiers" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "level" text,
  "complement" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_rrna" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "issuing_authority" text,
  "regulation_type" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_payment_methods" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_container_types" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "size_code" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anexo22_operation_types" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
-- SAAI error codes and registro types
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saai_error_codes" (
  "id" text PRIMARY KEY NOT NULL,
  "registro" integer NOT NULL,
  "campo" integer NOT NULL,
  "tipo" integer NOT NULL,
  "numero" integer NOT NULL,
  "description" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saai_registro_types" (
  "id" text PRIMARY KEY NOT NULL,
  "code" integer NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
