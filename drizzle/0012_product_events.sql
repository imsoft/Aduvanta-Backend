-- Product events table for analytics tracking
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_events" (
  "id" text PRIMARY KEY NOT NULL,
  "event_id" text NOT NULL UNIQUE,
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
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_events_org_occurred" ON "product_events" ("organization_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_events_user_occurred" ON "product_events" ("user_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_events_name_occurred" ON "product_events" ("event_name", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_events_session" ON "product_events" ("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_events_category" ON "product_events" ("category", "occurred_at");
