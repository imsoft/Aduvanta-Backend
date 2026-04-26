/**
 * Parser: Lista Arancelaria México T-MEC (Anexo 2B)
 *
 * Reads the pdftotext layout output and generates two SQL seeds:
 *   1. trade_agreements  — inserts the T-MEC agreement record
 *   2. tariff_agreement_preferences — T-MEC preferential rate per fraction
 *
 * Usage:
 *   pdftotext -layout <Anexo2BMexicoListaArancelaria.pdf> /tmp/lista-layout.txt
 *   npx tsx drizzle/parsers/parse-tmec.ts /tmp/lista-layout.txt > drizzle/seeds/tmec-seed.sql
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npx tsx parse-tmec.ts <layout-text-file>');
  process.exit(1);
}

const text = readFileSync(inputPath, 'utf-8');
const lines = text.split('\n');

// Matches lines that start a new fraction entry:
// 1-5 spaces, then the fraction in X.XX.XX format, then 2+ spaces
const FRACTION_START = /^\s{1,6}(\d{4}\.\d{2}\.\d{2})\s{2,}/;

// Right-aligned rate at end of line: 3+ spaces then a number or rate token
const RATE_AT_END = /\s{3,}(\d+(?:\.\d+)?(?:%)?|Ex\.|LF|C)\s*$/;

// Lines to skip (page headers/footers)
const SKIP_LINE = /Lista arancelaria sujeta|establecen en el Anexo|LISTA ARANCELARIA|Fracción|arancelaria|Descripción|EE\. UU\.|^\s*$/;

interface Entry {
  code: string;       // raw with dots: "0101.21.01"
  codeClean: string;  // without dots: "01012101"
  description: string;
  rate: string;       // "0%", "5%", "10%", etc.
}

const entries: Entry[] = [];
let current: Partial<Entry> | null = null;

function parseRate(raw: string): string {
  if (!raw || raw === 'C' || raw === 'LF' || raw === 'Ex.') return '0%';
  const num = parseFloat(raw);
  if (isNaN(num)) return '0%';
  return `${num}%`;
}

function finalize(entry: Partial<Entry>): Entry | null {
  if (!entry.code || !entry.description) return null;
  return {
    code: entry.code,
    codeClean: entry.code.replace(/\./g, ''),
    description: entry.description.trim().replace(/\s+/g, ' '),
    rate: entry.rate ?? '0%',
  };
}

for (const line of lines) {
  if (SKIP_LINE.test(line)) continue;

  const fractionMatch = line.match(FRACTION_START);

  if (fractionMatch) {
    if (current) {
      const entry = finalize(current);
      if (entry) entries.push(entry);
    }

    const afterFraction = line.slice(fractionMatch[0].length);
    const rateMatch = afterFraction.match(RATE_AT_END);

    let description = afterFraction;
    let rate = '0%';

    if (rateMatch) {
      description = afterFraction.slice(0, afterFraction.length - rateMatch[0].length);
      rate = parseRate(rateMatch[1]);
    }

    current = {
      code: fractionMatch[1],
      codeClean: fractionMatch[1].replace(/\./g, ''),
      description: description.trim(),
      rate,
    };
  } else if (current && line.match(/^\s{16,}/) && line.trim()) {
    // Continuation line — append to description (strip any trailing rate artifact)
    const trimmed = line.trim().replace(RATE_AT_END, '').trim();
    if (trimmed) {
      current.description = (current.description ?? '') + ' ' + trimmed;
    }
  }
}

if (current) {
  const entry = finalize(current);
  if (entry) entries.push(entry);
}

console.error(`Parsed ${entries.length} fraction entries`);

// ─── SQL generation ───────────────────────────────────────────────────────────

const BATCH_SIZE = 500;

function escape(str: string): string {
  return str.replace(/'/g, "''");
}

const batches: string[] = [];
for (let i = 0; i < entries.length; i += BATCH_SIZE) {
  batches.push(entries.slice(i, i + BATCH_SIZE).map(e =>
    `  ('${escape(e.codeClean)}', '${escape(e.rate)}')`
  ).join(',\n'));
}

const sql = `-- =============================================================================
-- T-MEC (USMCA) Lista Arancelaria — Preferential Rates Seed
-- Source: Anexo 2B México Lista Arancelaria (gob.mx)
-- Generated: ${new Date().toISOString().slice(0, 10)}
-- Fractions: ${entries.length}
--
-- Prerequisites: tariff_fractions must be seeded with TIGIE data first.
-- Fractions not yet in tariff_fractions are silently skipped.
-- Idempotent: ON CONFLICT DO NOTHING on trade_agreements and preferences.
-- =============================================================================

BEGIN;

-- 1. Trade agreement record
INSERT INTO trade_agreements (id, code, name, partner_countries, effective_date, notes)
VALUES (
  gen_random_uuid(),
  'T-MEC',
  'Tratado entre México, Estados Unidos y Canadá',
  'Estados Unidos, Canadá',
  '2020-07-01',
  'Sucesor del TLCAN. Fuente: Anexo 2B Lista Arancelaria México.'
)
ON CONFLICT (code) DO NOTHING;

-- 2. Preferential rates — inserted in batches of ${BATCH_SIZE}
-- Uses a CTE per batch: only inserts for fractions already in tariff_fractions.

${batches.map((batch, i) => `-- Batch ${i + 1}/${batches.length}
WITH _vals AS (
  SELECT code, rate FROM (VALUES
${batch}
  ) AS v(code, rate)
),
_agreement AS (SELECT id FROM trade_agreements WHERE code = 'T-MEC')
INSERT INTO tariff_agreement_preferences (id, fraction_id, agreement_id, preferential_rate)
SELECT gen_random_uuid(), tf.id, a.id, v.rate
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
CROSS JOIN _agreement a
ON CONFLICT (fraction_id, agreement_id) DO NOTHING;`).join('\n\n')}

COMMIT;
`;

process.stdout.write(sql);
