CREATE TABLE "document_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"rule_set_id" text NOT NULL,
	"document_category_id" text NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "doc_req_rule_set_category_unique" UNIQUE("rule_set_id","document_category_id")
);
--> statement-breakpoint
CREATE TABLE "rule_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"operation_type" "operation_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rule_sets_code_org_unique" UNIQUE("organization_id","code")
);
--> statement-breakpoint
CREATE TABLE "status_transition_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"rule_set_id" text NOT NULL,
	"from_status" "operation_status" NOT NULL,
	"to_status" "operation_status" NOT NULL,
	"requires_all_required_documents" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "status_rule_from_to_unique" UNIQUE("rule_set_id","from_status","to_status")
);
--> statement-breakpoint
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_rule_set_id_rule_sets_id_fk" FOREIGN KEY ("rule_set_id") REFERENCES "public"."rule_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_document_category_id_document_categories_id_fk" FOREIGN KEY ("document_category_id") REFERENCES "public"."document_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_transition_rules" ADD CONSTRAINT "status_transition_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_transition_rules" ADD CONSTRAINT "status_transition_rules_rule_set_id_rule_sets_id_fk" FOREIGN KEY ("rule_set_id") REFERENCES "public"."rule_sets"("id") ON DELETE cascade ON UPDATE no action;