/**
 * Parser: Anexo 17 RGCE 2026 — Mercancías sin tránsito internacional
 *
 * Reads the pdftotext layout output and generates SQL seed for
 * tariff_regulations with type='OTHER' and the specific transit restriction.
 *
 * Usage:
 *   pdftotext -layout <Anexo17delasRGCEpara2026.pdf> /tmp/anexo17-layout.txt
 *   npx tsx drizzle/parsers/parse-anexo17.ts /tmp/anexo17-layout.txt > drizzle/seeds/anexo17-rgce2026-seed.sql
 *
 * Prerequisites: tariff_fractions must be seeded. Fractions not found are skipped.
 */

import { readFileSync } from 'node:fs';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npx tsx parse-anexo17.ts <layout-text-file>');
  process.exit(1);
}

const text = readFileSync(inputPath, 'utf-8');
const lines = text.split('\n');

const FRACTION_RE = /^(\d{4}\.\d{2}\.\d{2})/;

// Section header patterns
const SECTION_HEADERS: Array<{ pattern: RegExp; category: string; description: string; regulationType: string }> = [
  {
    pattern: /Mercancías cuyo arancel sea superior al 35/,
    category: 'ARANCEL_SUPERIOR_35',
    description: 'Mercancías cuyo arancel sea superior al 35% de acuerdo a la TIGIE — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección I)',
    regulationType: 'OTHER',
  },
  {
    pattern: /Llantas usadas y mercancías/,
    category: 'LLANTAS_USADAS',
    description: 'Llantas usadas y mercancías — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección II)',
    regulationType: 'OTHER',
  },
  {
    pattern: /Ropa usada/,
    category: 'ROPA_USADA',
    description: 'Ropa usada — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección III)',
    regulationType: 'OTHER',
  },
  {
    pattern: /Armas, cartuchos, explosivos/,
    category: 'ARMAS_SEDENA',
    description: 'Armas, cartuchos, explosivos y mercancías sujetas a permiso SEDENA — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección VI)',
    regulationType: 'PRIOR_PERMIT',
  },
  {
    pattern: /Mercancías prohibidas/,
    category: 'PROHIBIDAS',
    description: 'Mercancías prohibidas — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección VII)',
    regulationType: 'OTHER',
  },
  {
    pattern: /Art[íi]culos el[eé]ctricos.*electr[oó]nicos/,
    category: 'ELECTRONICOS',
    description: 'Artículos eléctricos, electrónicos y electrodomésticos — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección VIII)',
    regulationType: 'OTHER',
  },
  {
    pattern: /Manteca.*grasas|Cerveza|Cigarros|Madera contrachapada|Pañales|Textil|Calzado|Herramientas|Bicicletas|Juguetes/i,
    category: 'MERCANCIAS_ESPECIFICAS',
    description: 'Mercancías específicas (manteca, cerveza, cigarros, textil, calzado, etc.) — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección IX)',
    regulationType: 'OTHER',
  },
];

interface RestrictionEntry {
  code: string;       // raw with dots: "0713.33.99"
  codeClean: string;  // without dots: "07133399"
  category: string;
  description: string;
  regulationType: string;
}

const entries: RestrictionEntry[] = [];
let currentSection: (typeof SECTION_HEADERS)[0] | null = null;

for (const line of lines) {
  // Detect section changes
  for (const header of SECTION_HEADERS) {
    if (header.pattern.test(line)) {
      currentSection = header;
      break;
    }
  }

  if (!currentSection) continue;

  const fractionMatch = line.match(FRACTION_RE);
  if (fractionMatch) {
    const code = fractionMatch[1];
    const codeClean = code.replace(/\./g, '');

    // Avoid duplicates within same section
    const exists = entries.some(e => e.codeClean === codeClean && e.category === currentSection!.category);
    if (!exists) {
      entries.push({
        code,
        codeClean,
        category: currentSection.category,
        description: currentSection.description,
        regulationType: currentSection.regulationType,
      });
    }
  }
}

console.error(`Parsed ${entries.length} transit restriction entries`);

// ─── SQL generation ───────────────────────────────────────────────────────────

function escape(str: string): string {
  return str.replace(/'/g, "''");
}

// Group by regulation type for clarity
const byType = new Map<string, RestrictionEntry[]>();
for (const entry of entries) {
  const key = entry.regulationType;
  if (!byType.has(key)) byType.set(key, []);
  byType.get(key)!.push(entry);
}

const BATCH_SIZE = 200;

const batches: Array<{ regulationType: string; category: string; description: string; codes: string[] }> = [];

for (const entry of entries) {
  const last = batches[batches.length - 1];
  if (last && last.category === entry.category && last.codes.length < BATCH_SIZE) {
    last.codes.push(entry.codeClean);
  } else {
    batches.push({
      regulationType: entry.regulationType,
      category: entry.category,
      description: entry.description,
      codes: [entry.codeClean],
    });
  }
}

const sql = `-- =============================================================================
-- Anexo 17 RGCE 2026 — Mercancías sin tránsito internacional
-- Source: Anexo 17 de las Reglas Generales de Comercio Exterior para 2026
-- DOF: 14 de enero de 2026
-- Generated: ${new Date().toISOString().slice(0, 10)}
-- Entries: ${entries.length}
--
-- Creates tariff_regulations records marking fractions where international
-- transit through Mexican territory is NOT permitted.
--
-- Prerequisites: tariff_fractions must be seeded. Unknown fractions are skipped.
-- Idempotent: ON CONFLICT DO NOTHING.
-- =============================================================================

BEGIN;

${batches.map((batch, i) => `-- ${batch.category} (${batch.codes.length} fracciones)
WITH _vals(code) AS (
  VALUES
${batch.codes.map(c => `    ('${c}')`).join(',\n')}
)
INSERT INTO tariff_regulations (id, fraction_id, type, trade_flow, code, description, issuing_authority)
SELECT
  gen_random_uuid(),
  tf.id,
  '${batch.regulationType}'::regulation_type,
  'BOTH'::trade_flow,
  'RGCE-2026-ANEXO17',
  '${escape(batch.description)}',
  'SAT'
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
ON CONFLICT DO NOTHING;`).join('\n\n')}

COMMIT;
`;

process.stdout.write(sql);
