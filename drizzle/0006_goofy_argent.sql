CREATE TYPE "public"."operation_advance_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."operation_charge_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "operation_advances" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"operation_id" text NOT NULL,
	"amount" numeric(18, 4) NOT NULL,
	"currency" text NOT NULL,
	"reference" text,
	"notes" text,
	"received_at" timestamp with time zone NOT NULL,
	"status" "operation_advance_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operation_charges" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"operation_id" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"amount" numeric(18, 4) NOT NULL,
	"currency" text NOT NULL,
	"status" "operation_charge_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "operation_advances" ADD CONSTRAINT "operation_advances_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operation_advances" ADD CONSTRAINT "operation_advances_operation_id_operations_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operation_charges" ADD CONSTRAINT "operation_charges_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operation_charges" ADD CONSTRAINT "operation_charges_operation_id_operations_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE restrict ON UPDATE no action;