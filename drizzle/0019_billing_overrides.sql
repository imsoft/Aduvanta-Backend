CREATE TABLE "billing_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"discount_percent" integer DEFAULT 100 NOT NULL,
	"is_free" boolean DEFAULT true NOT NULL,
	"note" text,
	"valid_until" timestamp with time zone,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billing_overrides_organization_id_unique" UNIQUE("organization_id")
);
