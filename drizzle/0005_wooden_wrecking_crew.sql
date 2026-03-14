ALTER TYPE "public"."membership_role" ADD VALUE 'CLIENT';--> statement-breakpoint
CREATE TABLE "client_portal_access" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_portal_access_unique" UNIQUE("organization_id","client_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_client_visible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "operation_comments" ADD COLUMN "is_client_visible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "client_portal_access" ADD CONSTRAINT "client_portal_access_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_portal_access" ADD CONSTRAINT "client_portal_access_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;