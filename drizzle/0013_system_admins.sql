CREATE TABLE IF NOT EXISTS "system_admins" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "system_admins_user_id_unique" UNIQUE("user_id")
);
