CREATE TYPE announcement_level AS ENUM ('INFO', 'WARNING', 'CRITICAL');

CREATE TABLE IF NOT EXISTS system_announcements (
  id text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  level announcement_level NOT NULL DEFAULT 'INFO',
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
