-- =============================================================================
-- Anexo 17 RGCE 2026 — Mercancías sin tránsito internacional
-- Source: Anexo 17 de las Reglas Generales de Comercio Exterior para 2026
-- DOF: 14 de enero de 2026
-- Generated: 2026-04-26
-- Entries: 251
--
-- Creates tariff_regulations records marking fractions where international
-- transit through Mexican territory is NOT permitted.
--
-- Prerequisites: tariff_fractions must be seeded. Unknown fractions are skipped.
-- Idempotent: ON CONFLICT DO NOTHING.
-- =============================================================================

BEGIN;

-- ARANCEL_SUPERIOR_35 (4 fracciones)
WITH _vals(code) AS (
  VALUES
    ('07133399'),
    ('21011102'),
    ('21011199'),
    ('21011201')
)
INSERT INTO tariff_regulations (id, fraction_id, type, trade_flow, code, description, issuing_authority)
SELECT
  gen_random_uuid(),
  tf.id,
  'OTHER'::regulation_type,
  'BOTH'::trade_flow,
  'RGCE-2026-ANEXO17',
  'Mercancías cuyo arancel sea superior al 35% de acuerdo a la TIGIE — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección I)',
  'SAT'
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
ON CONFLICT DO NOTHING;

-- LLANTAS_USADAS (4 fracciones)
WITH _vals(code) AS (
  VALUES
    ('40040002'),
    ('40122001'),
    ('40122099'),
    ('87087099')
)
INSERT INTO tariff_regulations (id, fraction_id, type, trade_flow, code, description, issuing_authority)
SELECT
  gen_random_uuid(),
  tf.id,
  'OTHER'::regulation_type,
  'BOTH'::trade_flow,
  'RGCE-2026-ANEXO17',
  'Llantas usadas y mercancías — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección II)',
  'SAT'
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
ON CONFLICT DO NOTHING;

-- ROPA_USADA (1 fracciones)
WITH _vals(code) AS (
  VALUES
    ('63090001')
)
INSERT INTO tariff_regulations (id, fraction_id, type, trade_flow, code, description, issuing_authority)
SELECT
  gen_random_uuid(),
  tf.id,
  'OTHER'::regulation_type,
  'BOTH'::trade_flow,
  'RGCE-2026-ANEXO17',
  'Ropa usada — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección III)',
  'SAT'
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
ON CONFLICT DO NOTHING;

-- ARMAS_SEDENA (22 fracciones)
WITH _vals(code) AS (
  VALUES
    ('93011002'),
    ('93012001'),
    ('93019099'),
    ('93020002'),
    ('93031099'),
    ('93032091'),
    ('93033091'),
    ('93039099'),
    ('93040001'),
    ('93040099'),
    ('93051001'),
    ('93051099'),
    ('93052002'),
    ('93059999'),
    ('93062101'),
    ('93062199'),
    ('93062999'),
    ('93063004'),
    ('93063099'),
    ('93069003'),
    ('93069099'),
    ('93070001')
)
INSERT INTO tariff_regulations (id, fraction_id, type, trade_flow, code, description, issuing_authority)
SELECT
  gen_random_uuid(),
  tf.id,
  'PRIOR_PERMIT'::regulation_type,
  'BOTH'::trade_flow,
  'RGCE-2026-ANEXO17',
  'Armas, cartuchos, explosivos y mercancías sujetas a permiso SEDENA — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección VI)',
  'SAT'
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
ON CONFLICT DO NOTHING;

-- PROHIBIDAS (20 fracciones)
WITH _vals(code) AS (
  VALUES
    ('03019901'),
    ('12089003'),
    ('12099907'),
    ('12119002'),
    ('13021102'),
    ('13021902'),
    ('13023904'),
    ('28332903'),
    ('29038202'),
    ('29038903'),
    ('29105001'),
    ('29315901'),
    ('29391101'),
    ('30034901'),
    ('30034902'),
    ('30044901'),
    ('30044902'),
    ('41032002'),
    ('49089005'),
    ('49119105')
)
INSERT INTO tariff_regulations (id, fraction_id, type, trade_flow, code, description, issuing_authority)
SELECT
  gen_random_uuid(),
  tf.id,
  'OTHER'::regulation_type,
  'BOTH'::trade_flow,
  'RGCE-2026-ANEXO17',
  'Mercancías prohibidas — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección VII)',
  'SAT'
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
ON CONFLICT DO NOTHING;

-- ELECTRONICOS (17 fracciones)
WITH _vals(code) AS (
  VALUES
    ('85211002'),
    ('85232991'),
    ('85232999'),
    ('85234101'),
    ('85234999'),
    ('85235199'),
    ('85272101'),
    ('85272199'),
    ('85279102'),
    ('85287101'),
    ('85287199'),
    ('85287201'),
    ('85287202'),
    ('85287203'),
    ('85287204'),
    ('85287205'),
    ('85287206')
)
INSERT INTO tariff_regulations (id, fraction_id, type, trade_flow, code, description, issuing_authority)
SELECT
  gen_random_uuid(),
  tf.id,
  'OTHER'::regulation_type,
  'BOTH'::trade_flow,
  'RGCE-2026-ANEXO17',
  'Artículos eléctricos, electrónicos y electrodomésticos — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección VIII)',
  'SAT'
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
ON CONFLICT DO NOTHING;

-- MERCANCIAS_ESPECIFICAS (183 fracciones)
WITH _vals(code) AS (
  VALUES
    ('15011001'),
    ('15012091'),
    ('15019099'),
    ('15021001'),
    ('15029099'),
    ('15030002'),
    ('15060099'),
    ('15161001'),
    ('15179099'),
    ('15220001'),
    ('22030001'),
    ('24021001'),
    ('24022001'),
    ('24029099'),
    ('44121001'),
    ('44123101'),
    ('44123199'),
    ('44123391'),
    ('44123491'),
    ('44123991'),
    ('44124101'),
    ('44124291'),
    ('44124991'),
    ('44125101'),
    ('44125291'),
    ('44125991'),
    ('44129101'),
    ('44129291'),
    ('44129991'),
    ('96190001'),
    ('52081201'),
    ('52083201'),
    ('52091201'),
    ('52091991'),
    ('52093201'),
    ('52093991'),
    ('52094391'),
    ('52094991'),
    ('54082205'),
    ('54082402'),
    ('55134101'),
    ('55169201'),
    ('57033101'),
    ('57033999'),
    ('58013101'),
    ('58063201'),
    ('60011003'),
    ('60019201'),
    ('60064101'),
    ('60064201'),
    ('60064301'),
    ('60064401'),
    ('61023099'),
    ('61051002'),
    ('61061002'),
    ('61082103'),
    ('61091003'),
    ('61101103'),
    ('61102005'),
    ('61103001'),
    ('61103099'),
    ('61109091'),
    ('61121101'),
    ('61124101'),
    ('61151001'),
    ('61152101'),
    ('61159401'),
    ('61159501'),
    ('61159601'),
    ('61159991'),
    ('62014001'),
    ('62014002'),
    ('62014099'),
    ('62024099'),
    ('62032201'),
    ('62042201'),
    ('62079101'),
    ('62102091'),
    ('62103091'),
    ('62151001'),
    ('62152001'),
    ('63013001'),
    ('63014001'),
    ('63019091'),
    ('63022201'),
    ('58071001'),
    ('58079099'),
    ('73194001'),
    ('74198099'),
    ('83089091'),
    ('96061001'),
    ('96062201'),
    ('96063001'),
    ('96071101'),
    ('96071999'),
    ('96072001'),
    ('64011001'),
    ('64019999'),
    ('64021201'),
    ('64021901'),
    ('64021999'),
    ('64029102'),
    ('64029906'),
    ('64029991'),
    ('64029992'),
    ('64029993'),
    ('64031201'),
    ('64031902'),
    ('64031999'),
    ('64032001'),
    ('64035105'),
    ('64035999'),
    ('64039104'),
    ('64039112'),
    ('64039901'),
    ('64039906'),
    ('64039991'),
    ('64039999'),
    ('64041902'),
    ('64041999'),
    ('64042001'),
    ('64051001'),
    ('64052001'),
    ('64052002'),
    ('64059099'),
    ('64061008'),
    ('64061009'),
    ('64069002'),
    ('64069099'),
    ('68042291'),
    ('68052001'),
    ('82014001'),
    ('82019003'),
    ('82022001'),
    ('82023101'),
    ('82029104'),
    ('82032099'),
    ('82041101'),
    ('82041199'),
    ('82041299'),
    ('82042099'),
    ('82052001'),
    ('82054099'),
    ('82055999'),
    ('82074004'),
    ('82075007'),
    ('82076006'),
    ('82078001'),
    ('82083002'),
    ('90173002'),
    ('90178099'),
    ('96034001'),
    ('40132001'),
    ('87120005'),
    ('87149101'),
    ('87149201'),
    ('87149301'),
    ('87149401'),
    ('87149499'),
    ('87149501'),
    ('87149601'),
    ('87149999'),
    ('95030001'),
    ('95030002'),
    ('95030004'),
    ('95030008'),
    ('95030010'),
    ('95030011'),
    ('95030012'),
    ('95030015'),
    ('95030016'),
    ('95030020'),
    ('95030022'),
    ('95030023'),
    ('95030026'),
    ('95030030'),
    ('95030091'),
    ('95030093'),
    ('95030099'),
    ('95045004'),
    ('95049099'),
    ('95051001'),
    ('95051099')
)
INSERT INTO tariff_regulations (id, fraction_id, type, trade_flow, code, description, issuing_authority)
SELECT
  gen_random_uuid(),
  tf.id,
  'OTHER'::regulation_type,
  'BOTH'::trade_flow,
  'RGCE-2026-ANEXO17',
  'Mercancías específicas (manteca, cerveza, cigarros, textil, calzado, etc.) — no procede tránsito internacional (RGCE 2026 Anexo 17, Sección IX)',
  'SAT'
FROM _vals v
JOIN tariff_fractions tf ON tf.code = v.code
ON CONFLICT DO NOTHING;

COMMIT;
