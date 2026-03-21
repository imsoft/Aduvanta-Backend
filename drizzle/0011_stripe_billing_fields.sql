-- Stripe billing fields for organizations, plans, and subscriptions

-- Add Stripe customer ID to organizations
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "stripe_customer_id" text UNIQUE;

-- Add Stripe price IDs and display prices to plans
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "stripe_price_id_monthly" text;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "stripe_price_id_yearly" text;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "price_monthly" numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "price_yearly" numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "trial_days" integer NOT NULL DEFAULT 14;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "sort_order" integer NOT NULL DEFAULT 0;

-- Extend subscription_status enum with new values
--> statement-breakpoint
ALTER TYPE "subscription_status" ADD VALUE IF NOT EXISTS 'TRIALING';
--> statement-breakpoint
ALTER TYPE "subscription_status" ADD VALUE IF NOT EXISTS 'PAST_DUE';

-- Add Stripe subscription fields to organization_subscriptions
--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "stripe_subscription_id" text UNIQUE;
--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "billing_interval" text DEFAULT 'month';
--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "current_period_end" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "cancel_at_period_end" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "trial_ends_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD COLUMN "grace_period_ends_at" timestamp with time zone;
