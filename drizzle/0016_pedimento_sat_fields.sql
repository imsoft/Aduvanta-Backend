-- Migration 0016: Add missing SAT pedimento format fields
-- Covers: encabezado principal, incrementables, identificadores, contenedores

-- ─── customs_entries: new header + incrementable fields ───────────────────────
ALTER TABLE customs_entries
  ADD COLUMN IF NOT EXISTS gross_weight_kg numeric(16,4),
  ADD COLUMN IF NOT EXISTS package_count integer,
  ADD COLUMN IF NOT EXISTS package_marks text,
  ADD COLUMN IF NOT EXISTS freight_value numeric(16,2),
  ADD COLUMN IF NOT EXISTS insurance_value numeric(16,2),
  ADD COLUMN IF NOT EXISTS packaging_value numeric(16,2),
  ADD COLUMN IF NOT EXISTS other_incrementables numeric(16,2),
  ADD COLUMN IF NOT EXISTS incoterm text,
  ADD COLUMN IF NOT EXISTS vinculacion text,
  ADD COLUMN IF NOT EXISTS value_receipt_number text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS acceptance_code text,
  ADD COLUMN IF NOT EXISTS customs_section_key text,
  ADD COLUMN IF NOT EXISTS exit_date date;

-- ─── customs_entry_items: new partida fields ──────────────────────────────────
ALTER TABLE customs_entry_items
  ADD COLUMN IF NOT EXISTS tariff_subdivision text,
  ADD COLUMN IF NOT EXISTS valuation_method integer,
  ADD COLUMN IF NOT EXISTS commercial_quantity numeric(16,4),
  ADD COLUMN IF NOT EXISTS commercial_unit_of_measure text,
  ADD COLUMN IF NOT EXISTS paid_price_usd numeric(16,4),
  ADD COLUMN IF NOT EXISTS unit_price_usd numeric(16,4),
  ADD COLUMN IF NOT EXISTS customs_value_usd numeric(16,2),
  ADD COLUMN IF NOT EXISTS added_value_mxn numeric(16,2),
  ADD COLUMN IF NOT EXISTS vinculacion text,
  ADD COLUMN IF NOT EXISTS product_code text;

-- ─── customs_entry_identifiers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customs_entry_identifiers (
  id text PRIMARY KEY,
  entry_id text NOT NULL REFERENCES customs_entries(id) ON DELETE CASCADE,
  item_id text REFERENCES customs_entry_items(id) ON DELETE CASCADE,
  level text NOT NULL,
  code text NOT NULL,
  complement1 text,
  complement2 text,
  complement3 text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ─── customs_entry_containers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customs_entry_containers (
  id text PRIMARY KEY,
  entry_id text NOT NULL REFERENCES customs_entries(id) ON DELETE CASCADE,
  number text NOT NULL,
  container_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
