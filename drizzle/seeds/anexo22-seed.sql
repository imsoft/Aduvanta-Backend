-- =============================================================================
-- Anexo 22 SAT Reference Catalogs Seed
-- Official Mexican customs (pedimento) reference data
-- Idempotent: uses ON CONFLICT DO NOTHING on all inserts
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. CUSTOMS SECTIONS (Apendice 1: Aduanas y secciones aduaneras)
-- =============================================================================
INSERT INTO anexo22_customs_sections (id, code, name, section_code, section_name, city, state, is_active, sort_order) VALUES
  (gen_random_uuid(), '240', 'Aduana de Nuevo Laredo', '240', 'Nuevo Laredo', 'Nuevo Laredo', 'Tamaulipas', true, 1),
  (gen_random_uuid(), '241', 'Sección Aduanera del Puente Internacional Colombia', '240', 'Nuevo Laredo', 'Anáhuac', 'Nuevo León', true, 2),
  (gen_random_uuid(), '320', 'Aduana de Ciudad Juárez', '320', 'Ciudad Juárez', 'Ciudad Juárez', 'Chihuahua', true, 3),
  (gen_random_uuid(), '321', 'Sección Aduanera de San Jerónimo', '320', 'Ciudad Juárez', 'Ciudad Juárez', 'Chihuahua', true, 4),
  (gen_random_uuid(), '470', 'Aduana de Veracruz', '470', 'Veracruz', 'Veracruz', 'Veracruz', true, 5),
  (gen_random_uuid(), '440', 'Aduana de Manzanillo', '440', 'Manzanillo', 'Manzanillo', 'Colima', true, 6),
  (gen_random_uuid(), '450', 'Aduana de Lázaro Cárdenas', '450', 'Lázaro Cárdenas', 'Lázaro Cárdenas', 'Michoacán', true, 7),
  (gen_random_uuid(), '400', 'Aduana de Guadalajara', '400', 'Guadalajara', 'Guadalajara', 'Jalisco', true, 8),
  (gen_random_uuid(), '270', 'Aduana de Monterrey', '270', 'Monterrey', 'Monterrey', 'Nuevo León', true, 9),
  (gen_random_uuid(), '430', 'Aduana de México (Interior)', '430', 'México', 'Ciudad de México', 'Ciudad de México', true, 10),
  (gen_random_uuid(), '431', 'Aduana del Aeropuerto Internacional de la Ciudad de México', '430', 'México', 'Ciudad de México', 'Ciudad de México', true, 11),
  (gen_random_uuid(), '370', 'Aduana de Tijuana', '370', 'Tijuana', 'Tijuana', 'Baja California', true, 12),
  (gen_random_uuid(), '371', 'Sección Aduanera de Otay', '370', 'Tijuana', 'Tijuana', 'Baja California', true, 13),
  (gen_random_uuid(), '350', 'Aduana de Nogales', '350', 'Nogales', 'Nogales', 'Sonora', true, 14),
  (gen_random_uuid(), '250', 'Aduana de Piedras Negras', '250', 'Piedras Negras', 'Piedras Negras', 'Coahuila', true, 15),
  (gen_random_uuid(), '230', 'Aduana de Matamoros', '230', 'Matamoros', 'Matamoros', 'Tamaulipas', true, 16),
  (gen_random_uuid(), '460', 'Aduana de Altamira', '460', 'Altamira', 'Altamira', 'Tamaulipas', true, 17),
  (gen_random_uuid(), '260', 'Aduana de Reynosa', '260', 'Reynosa', 'Reynosa', 'Tamaulipas', true, 18),
  (gen_random_uuid(), '280', 'Aduana de Aguascalientes', '280', 'Aguascalientes', 'Aguascalientes', 'Aguascalientes', true, 19),
  (gen_random_uuid(), '500', 'Aduana de Ciudad Hidalgo', '500', 'Ciudad Hidalgo', 'Ciudad Hidalgo', 'Chiapas', true, 20),
  (gen_random_uuid(), '510', 'Aduana de Cancún', '510', 'Cancún', 'Cancún', 'Quintana Roo', true, 21),
  (gen_random_uuid(), '360', 'Aduana de Mexicali', '360', 'Mexicali', 'Mexicali', 'Baja California', true, 22),
  (gen_random_uuid(), '300', 'Aduana de Chihuahua', '300', 'Chihuahua', 'Chihuahua', 'Chihuahua', true, 23),
  (gen_random_uuid(), '310', 'Aduana de Ojinaga', '310', 'Ojinaga', 'Ojinaga', 'Chihuahua', true, 24),
  (gen_random_uuid(), '340', 'Aduana de Agua Prieta', '340', 'Agua Prieta', 'Agua Prieta', 'Sonora', true, 25),
  (gen_random_uuid(), '380', 'Aduana de Ensenada', '380', 'Ensenada', 'Ensenada', 'Baja California', true, 26),
  (gen_random_uuid(), '390', 'Aduana de La Paz', '390', 'La Paz', 'La Paz', 'Baja California Sur', true, 27),
  (gen_random_uuid(), '410', 'Aduana de Querétaro', '410', 'Querétaro', 'Querétaro', 'Querétaro', true, 28),
  (gen_random_uuid(), '420', 'Aduana de Puebla', '420', 'Puebla', 'Puebla', 'Puebla', true, 29),
  (gen_random_uuid(), '480', 'Aduana de Progreso', '480', 'Progreso', 'Progreso', 'Yucatán', true, 30),
  (gen_random_uuid(), '490', 'Aduana de Dos Bocas', '490', 'Dos Bocas', 'Paraíso', 'Tabasco', true, 31),
  (gen_random_uuid(), '520', 'Aduana de Subteniente López', '520', 'Subteniente López', 'Othón P. Blanco', 'Quintana Roo', true, 32),
  (gen_random_uuid(), '471', 'Sección Aduanera de Coatzacoalcos', '470', 'Veracruz', 'Coatzacoalcos', 'Veracruz', true, 33),
  (gen_random_uuid(), '200', 'Aduana de Acapulco', '200', 'Acapulco', 'Acapulco', 'Guerrero', true, 34),
  (gen_random_uuid(), '210', 'Aduana de Guaymas', '210', 'Guaymas', 'Guaymas', 'Sonora', true, 35),
  (gen_random_uuid(), '220', 'Aduana de Mazatlán', '220', 'Mazatlán', 'Mazatlán', 'Sinaloa', true, 36),
  (gen_random_uuid(), '290', 'Aduana de Torreón', '290', 'Torreón', 'Torreón', 'Coahuila', true, 37),
  (gen_random_uuid(), '330', 'Aduana de Palomas (Puerto Palomas)', '330', 'Palomas', 'Ascensión', 'Chihuahua', true, 38),
  (gen_random_uuid(), '432', 'Aduana de Toluca', '430', 'México', 'Toluca', 'Estado de México', true, 39),
  (gen_random_uuid(), '401', 'Aduana del Aeropuerto Internacional de Guadalajara', '400', 'Guadalajara', 'Tlajomulco', 'Jalisco', true, 40),
  (gen_random_uuid(), '441', 'Sección Aduanera del Interior del Puerto de Manzanillo', '440', 'Manzanillo', 'Manzanillo', 'Colima', true, 41),
  (gen_random_uuid(), '271', 'Aduana del Aeropuerto Internacional de Monterrey', '270', 'Monterrey', 'Apodaca', 'Nuevo León', true, 42),
  (gen_random_uuid(), '501', 'Aduana de Tapachula', '500', 'Ciudad Hidalgo', 'Tapachula', 'Chiapas', true, 43),
  (gen_random_uuid(), '475', 'Aduana de Tuxpan', '470', 'Veracruz', 'Tuxpan', 'Veracruz', true, 44),
  (gen_random_uuid(), '282', 'Aduana de San Luis Potosí', '280', 'Aguascalientes', 'San Luis Potosí', 'San Luis Potosí', true, 45),
  (gen_random_uuid(), '281', 'Aduana de León', '280', 'Aguascalientes', 'León', 'Guanajuato', true, 46),
  (gen_random_uuid(), '421', 'Aduana del Aeropuerto Internacional de Puebla', '420', 'Puebla', 'Huejotzingo', 'Puebla', true, 47),
  (gen_random_uuid(), '511', 'Aduana del Aeropuerto Internacional de Cancún', '510', 'Cancún', 'Cancún', 'Quintana Roo', true, 48),
  (gen_random_uuid(), '433', 'Aduana del Aeropuerto Internacional de Toluca', '430', 'México', 'Toluca', 'Estado de México', true, 49)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 2. TRANSPORT MEANS (Apendice 3: Medios de transporte)
-- =============================================================================
INSERT INTO anexo22_transport_means (id, code, description, is_active, sort_order) VALUES
  (gen_random_uuid(), '1', 'Marítimo', true, 1),
  (gen_random_uuid(), '2', 'Ferrocarril', true, 2),
  (gen_random_uuid(), '3', 'Carretero', true, 3),
  (gen_random_uuid(), '4', 'Aéreo', true, 4),
  (gen_random_uuid(), '5', 'Conducción (ductos)', true, 5),
  (gen_random_uuid(), '6', 'Multimodal', true, 6),
  (gen_random_uuid(), '7', 'Otros', true, 7)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 3. PEDIMENTO KEYS (Apendice 2: Claves de pedimento)
-- =============================================================================
INSERT INTO anexo22_pedimento_keys (id, code, description, operation_type, is_active, sort_order) VALUES
  (gen_random_uuid(), 'A1', 'Importación o exportación definitiva', 'IMP', true, 1),
  (gen_random_uuid(), 'A3', 'Importación temporal', 'IMP', true, 2),
  (gen_random_uuid(), 'A4', 'Retorno de mercancías exportadas temporalmente', 'IMP', true, 3),
  (gen_random_uuid(), 'AA', 'Importación o exportación definitiva mediante pedimento consolidado', 'IMP', true, 4),
  (gen_random_uuid(), 'AF', 'Importación definitiva por empresas de la industria automotriz terminal o manufacturera de vehículos de autotransporte', 'IMP', true, 5),
  (gen_random_uuid(), 'AV', 'Importación temporal por operaciones virtuales IMMEX', 'IMP', true, 6),
  (gen_random_uuid(), 'B1', 'Exportación definitiva', 'EXP', true, 7),
  (gen_random_uuid(), 'B3', 'Exportación temporal', 'EXP', true, 8),
  (gen_random_uuid(), 'B4', 'Retorno de importación temporal', 'EXP', true, 9),
  (gen_random_uuid(), 'BA', 'Exportación definitiva mediante pedimento consolidado', 'EXP', true, 10),
  (gen_random_uuid(), 'BF', 'Exportación definitiva por empresas de la industria automotriz terminal o manufacturera de vehículos de autotransporte', 'EXP', true, 11),
  (gen_random_uuid(), 'BV', 'Exportación temporal por operaciones virtuales IMMEX', 'EXP', true, 12),
  (gen_random_uuid(), 'C1', 'Tránsito interno de entrada', 'TRA', true, 13),
  (gen_random_uuid(), 'C2', 'Tránsito interno de salida', 'TRA', true, 14),
  (gen_random_uuid(), 'C3', 'Tránsito interno de entrada y salida', 'TRA', true, 15),
  (gen_random_uuid(), 'E1', 'Importación definitiva por empresas IMMEX', 'IMP', true, 16),
  (gen_random_uuid(), 'F4', 'Importación temporal IMMEX', 'IMP', true, 17),
  (gen_random_uuid(), 'F5', 'Retorno de importación temporal IMMEX', 'EXP', true, 18),
  (gen_random_uuid(), 'G1', 'Depósito fiscal de mercancías', 'IMP', true, 19),
  (gen_random_uuid(), 'G2', 'Retiro de depósito fiscal para importación definitiva', 'IMP', true, 20),
  (gen_random_uuid(), 'G3', 'Retiro de depósito fiscal para exportación definitiva', 'EXP', true, 21),
  (gen_random_uuid(), 'G7', 'Retiro de depósito fiscal para retorno al extranjero', 'EXP', true, 22),
  (gen_random_uuid(), 'H1', 'Elaboración, transformación o reparación en recinto fiscalizado', 'IMP', true, 23),
  (gen_random_uuid(), 'H2', 'Retorno de elaboración, transformación o reparación en recinto fiscalizado', 'EXP', true, 24),
  (gen_random_uuid(), 'H5', 'Elaboración, transformación o reparación en recinto fiscalizado estratégico', 'IMP', true, 25),
  (gen_random_uuid(), 'H6', 'Retorno de recinto fiscalizado estratégico', 'EXP', true, 26),
  (gen_random_uuid(), 'IN', 'Tránsito internacional por territorio nacional', 'TRA', true, 27),
  (gen_random_uuid(), 'K1', 'Cambio de régimen de importación temporal a definitiva', 'IMP', true, 28),
  (gen_random_uuid(), 'K2', 'Cambio de régimen de exportación temporal a definitiva', 'EXP', true, 29),
  (gen_random_uuid(), 'R1', 'Rectificación de datos', NULL, true, 30),
  (gen_random_uuid(), 'RT', 'Retorno de mercancías', 'EXP', true, 31),
  (gen_random_uuid(), 'V1', 'Virtual de importación (traspasos IMMEX)', 'IMP', true, 32),
  (gen_random_uuid(), 'V5', 'Virtual de exportación (traspasos IMMEX)', 'EXP', true, 33),
  (gen_random_uuid(), 'V7', 'Virtual de importación definitiva de empresas de la industria automotriz terminal', 'IMP', true, 34),
  (gen_random_uuid(), 'V8', 'Virtual de exportación definitiva de empresas de la industria automotriz terminal', 'EXP', true, 35),
  (gen_random_uuid(), 'CT', 'Pedimento complementario de tránsito', 'TRA', true, 36)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 4. CUSTOMS REGIMES (Apendice 13: Regimenes aduaneros)
-- =============================================================================
INSERT INTO anexo22_customs_regimes (id, code, description, operation_type, is_active, sort_order) VALUES
  (gen_random_uuid(), 'IMD', 'Importación Definitiva', 'IMP', true, 1),
  (gen_random_uuid(), 'ITE', 'Importación Temporal para Elaboración, Transformación o Reparación', 'IMP', true, 2),
  (gen_random_uuid(), 'ITR', 'Importación Temporal para Retorno en su Mismo Estado', 'IMP', true, 3),
  (gen_random_uuid(), 'EXD', 'Exportación Definitiva', 'EXP', true, 4),
  (gen_random_uuid(), 'ETE', 'Exportación Temporal para Elaboración, Transformación o Reparación', 'EXP', true, 5),
  (gen_random_uuid(), 'ETR', 'Exportación Temporal para Retorno en su Mismo Estado', 'EXP', true, 6),
  (gen_random_uuid(), 'DFI', 'Depósito Fiscal para Importación', 'IMP', true, 7),
  (gen_random_uuid(), 'DFE', 'Depósito Fiscal para Exportación', 'EXP', true, 8),
  (gen_random_uuid(), 'TRI', 'Tránsito Interno', 'TRA', true, 9),
  (gen_random_uuid(), 'TRE', 'Tránsito Internacional', 'TRA', true, 10),
  (gen_random_uuid(), 'ELB', 'Elaboración, Transformación o Reparación en Recinto Fiscalizado', 'IMP', true, 11),
  (gen_random_uuid(), 'RFE', 'Recinto Fiscalizado Estratégico', 'IMP', true, 12)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 5. UNITS OF MEASURE (Apendice 7: Unidades de medida)
-- =============================================================================
INSERT INTO anexo22_units_of_measure (id, code, description, abbreviation, unit_type, is_active, sort_order) VALUES
  (gen_random_uuid(), '01', 'Kilogramo', 'Kg', 'weight', true, 1),
  (gen_random_uuid(), '02', 'Gramo', 'g', 'weight', true, 2),
  (gen_random_uuid(), '03', 'Metro lineal', 'm', 'length', true, 3),
  (gen_random_uuid(), '04', 'Metro cuadrado', 'm²', 'area', true, 4),
  (gen_random_uuid(), '05', 'Metro cúbico', 'm³', 'volume', true, 5),
  (gen_random_uuid(), '06', 'Pieza', 'Pza', 'unit', true, 6),
  (gen_random_uuid(), '07', 'Cabeza', 'Cbza', 'unit', true, 7),
  (gen_random_uuid(), '08', 'Litro', 'L', 'volume', true, 8),
  (gen_random_uuid(), '09', 'Par', 'Par', 'unit', true, 9),
  (gen_random_uuid(), '10', 'Kilowatt', 'kW', 'energy', true, 10),
  (gen_random_uuid(), '11', 'Millar', 'Mill', 'unit', true, 11),
  (gen_random_uuid(), '12', 'Juego', 'Jgo', 'unit', true, 12),
  (gen_random_uuid(), '13', 'Kilowatt-hora', 'kWh', 'energy', true, 13),
  (gen_random_uuid(), '14', 'Tonelada', 'Ton', 'weight', true, 14),
  (gen_random_uuid(), '15', 'Barril', 'Bbl', 'volume', true, 15),
  (gen_random_uuid(), '16', 'Galón', 'Gal', 'volume', true, 16),
  (gen_random_uuid(), '17', 'Docena', 'Doc', 'unit', true, 17),
  (gen_random_uuid(), '18', 'Decena', 'Dec', 'unit', true, 18),
  (gen_random_uuid(), '19', 'Gruesa', 'Gra', 'unit', true, 19),
  (gen_random_uuid(), '20', 'Ciento', 'Cto', 'unit', true, 20),
  (gen_random_uuid(), '21', 'Quilate', 'Qlt', 'weight', true, 21),
  (gen_random_uuid(), '22', 'Centímetro cuadrado', 'cm²', 'area', true, 22),
  (gen_random_uuid(), '23', 'Mililitro', 'mL', 'volume', true, 23),
  (gen_random_uuid(), '24', 'Centímetro cúbico', 'cm³', 'volume', true, 24)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 6. COUNTRIES (Apendice 4: Paises - SAT codes)
-- =============================================================================
INSERT INTO anexo22_countries (id, code, name, iso_alpha2, iso_alpha3, region, is_active, sort_order) VALUES
  (gen_random_uuid(), 'USA', 'Estados Unidos de América', 'US', 'USA', 'North America', true, 1),
  (gen_random_uuid(), 'CHN', 'China', 'CN', 'CHN', 'Asia', true, 2),
  (gen_random_uuid(), 'JPN', 'Japón', 'JP', 'JPN', 'Asia', true, 3),
  (gen_random_uuid(), 'DEU', 'Alemania', 'DE', 'DEU', 'Europe', true, 4),
  (gen_random_uuid(), 'CAN', 'Canadá', 'CA', 'CAN', 'North America', true, 5),
  (gen_random_uuid(), 'KOR', 'Corea del Sur', 'KR', 'KOR', 'Asia', true, 6),
  (gen_random_uuid(), 'BRA', 'Brasil', 'BR', 'BRA', 'South America', true, 7),
  (gen_random_uuid(), 'GBR', 'Reino Unido', 'GB', 'GBR', 'Europe', true, 8),
  (gen_random_uuid(), 'FRA', 'Francia', 'FR', 'FRA', 'Europe', true, 9),
  (gen_random_uuid(), 'ITA', 'Italia', 'IT', 'ITA', 'Europe', true, 10),
  (gen_random_uuid(), 'ESP', 'España', 'ES', 'ESP', 'Europe', true, 11),
  (gen_random_uuid(), 'IND', 'India', 'IN', 'IND', 'Asia', true, 12),
  (gen_random_uuid(), 'TWN', 'Taiwán', 'TW', 'TWN', 'Asia', true, 13),
  (gen_random_uuid(), 'THA', 'Tailandia', 'TH', 'THA', 'Asia', true, 14),
  (gen_random_uuid(), 'MYS', 'Malasia', 'MY', 'MYS', 'Asia', true, 15),
  (gen_random_uuid(), 'VNM', 'Vietnam', 'VN', 'VNM', 'Asia', true, 16),
  (gen_random_uuid(), 'IDN', 'Indonesia', 'ID', 'IDN', 'Asia', true, 17),
  (gen_random_uuid(), 'NLD', 'Países Bajos', 'NL', 'NLD', 'Europe', true, 18),
  (gen_random_uuid(), 'CHE', 'Suiza', 'CH', 'CHE', 'Europe', true, 19),
  (gen_random_uuid(), 'SWE', 'Suecia', 'SE', 'SWE', 'Europe', true, 20),
  (gen_random_uuid(), 'AUT', 'Austria', 'AT', 'AUT', 'Europe', true, 21),
  (gen_random_uuid(), 'BEL', 'Bélgica', 'BE', 'BEL', 'Europe', true, 22),
  (gen_random_uuid(), 'PRT', 'Portugal', 'PT', 'PRT', 'Europe', true, 23),
  (gen_random_uuid(), 'POL', 'Polonia', 'PL', 'POL', 'Europe', true, 24),
  (gen_random_uuid(), 'CZE', 'República Checa', 'CZ', 'CZE', 'Europe', true, 25),
  (gen_random_uuid(), 'TUR', 'Turquía', 'TR', 'TUR', 'Europe', true, 26),
  (gen_random_uuid(), 'RUS', 'Rusia', 'RU', 'RUS', 'Europe', true, 27),
  (gen_random_uuid(), 'ARG', 'Argentina', 'AR', 'ARG', 'South America', true, 28),
  (gen_random_uuid(), 'CHL', 'Chile', 'CL', 'CHL', 'South America', true, 29),
  (gen_random_uuid(), 'COL', 'Colombia', 'CO', 'COL', 'South America', true, 30),
  (gen_random_uuid(), 'PER', 'Perú', 'PE', 'PER', 'South America', true, 31),
  (gen_random_uuid(), 'GTM', 'Guatemala', 'GT', 'GTM', 'Central America', true, 32),
  (gen_random_uuid(), 'CRI', 'Costa Rica', 'CR', 'CRI', 'Central America', true, 33),
  (gen_random_uuid(), 'PAN', 'Panamá', 'PA', 'PAN', 'Central America', true, 34),
  (gen_random_uuid(), 'DOM', 'República Dominicana', 'DO', 'DOM', 'Caribbean', true, 35),
  (gen_random_uuid(), 'ECU', 'Ecuador', 'EC', 'ECU', 'South America', true, 36),
  (gen_random_uuid(), 'VEN', 'Venezuela', 'VE', 'VEN', 'South America', true, 37),
  (gen_random_uuid(), 'URY', 'Uruguay', 'UY', 'URY', 'South America', true, 38),
  (gen_random_uuid(), 'PRY', 'Paraguay', 'PY', 'PRY', 'South America', true, 39),
  (gen_random_uuid(), 'BOL', 'Bolivia', 'BO', 'BOL', 'South America', true, 40),
  (gen_random_uuid(), 'HND', 'Honduras', 'HN', 'HND', 'Central America', true, 41),
  (gen_random_uuid(), 'SLV', 'El Salvador', 'SV', 'SLV', 'Central America', true, 42),
  (gen_random_uuid(), 'NIC', 'Nicaragua', 'NI', 'NIC', 'Central America', true, 43),
  (gen_random_uuid(), 'CUB', 'Cuba', 'CU', 'CUB', 'Caribbean', true, 44),
  (gen_random_uuid(), 'AUS', 'Australia', 'AU', 'AUS', 'Oceania', true, 45),
  (gen_random_uuid(), 'NZL', 'Nueva Zelanda', 'NZ', 'NZL', 'Oceania', true, 46),
  (gen_random_uuid(), 'ZAF', 'Sudáfrica', 'ZA', 'ZAF', 'Africa', true, 47),
  (gen_random_uuid(), 'ISR', 'Israel', 'IL', 'ISR', 'Middle East', true, 48),
  (gen_random_uuid(), 'SAU', 'Arabia Saudita', 'SA', 'SAU', 'Middle East', true, 49),
  (gen_random_uuid(), 'ARE', 'Emiratos Árabes Unidos', 'AE', 'ARE', 'Middle East', true, 50),
  (gen_random_uuid(), 'SGP', 'Singapur', 'SG', 'SGP', 'Asia', true, 51),
  (gen_random_uuid(), 'PHL', 'Filipinas', 'PH', 'PHL', 'Asia', true, 52),
  (gen_random_uuid(), 'HKG', 'Hong Kong', 'HK', 'HKG', 'Asia', true, 53),
  (gen_random_uuid(), 'DNK', 'Dinamarca', 'DK', 'DNK', 'Europe', true, 54),
  (gen_random_uuid(), 'FIN', 'Finlandia', 'FI', 'FIN', 'Europe', true, 55),
  (gen_random_uuid(), 'NOR', 'Noruega', 'NO', 'NOR', 'Europe', true, 56),
  (gen_random_uuid(), 'IRL', 'Irlanda', 'IE', 'IRL', 'Europe', true, 57),
  (gen_random_uuid(), 'HUN', 'Hungría', 'HU', 'HUN', 'Europe', true, 58),
  (gen_random_uuid(), 'ROU', 'Rumania', 'RO', 'ROU', 'Europe', true, 59),
  (gen_random_uuid(), 'MEX', 'México', 'MX', 'MEX', 'North America', true, 60)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 7. CURRENCIES (Apendice 5: Monedas / divisas)
-- =============================================================================
INSERT INTO anexo22_currencies (id, code, name, symbol, country, is_active, sort_order) VALUES
  (gen_random_uuid(), 'USD', 'Dólar estadounidense', '$', 'Estados Unidos', true, 1),
  (gen_random_uuid(), 'EUR', 'Euro', '€', 'Unión Europea', true, 2),
  (gen_random_uuid(), 'GBP', 'Libra esterlina', '£', 'Reino Unido', true, 3),
  (gen_random_uuid(), 'JPY', 'Yen japonés', '¥', 'Japón', true, 4),
  (gen_random_uuid(), 'CNY', 'Yuan renminbi', '¥', 'China', true, 5),
  (gen_random_uuid(), 'MXN', 'Peso mexicano', '$', 'México', true, 6),
  (gen_random_uuid(), 'CAD', 'Dólar canadiense', '$', 'Canadá', true, 7),
  (gen_random_uuid(), 'CHF', 'Franco suizo', 'CHF', 'Suiza', true, 8),
  (gen_random_uuid(), 'KRW', 'Won surcoreano', '₩', 'Corea del Sur', true, 9),
  (gen_random_uuid(), 'BRL', 'Real brasileño', 'R$', 'Brasil', true, 10),
  (gen_random_uuid(), 'ARS', 'Peso argentino', '$', 'Argentina', true, 11),
  (gen_random_uuid(), 'CLP', 'Peso chileno', '$', 'Chile', true, 12),
  (gen_random_uuid(), 'COP', 'Peso colombiano', '$', 'Colombia', true, 13),
  (gen_random_uuid(), 'PEN', 'Sol peruano', 'S/', 'Perú', true, 14),
  (gen_random_uuid(), 'AUD', 'Dólar australiano', '$', 'Australia', true, 15),
  (gen_random_uuid(), 'NZD', 'Dólar neozelandés', '$', 'Nueva Zelanda', true, 16),
  (gen_random_uuid(), 'SEK', 'Corona sueca', 'kr', 'Suecia', true, 17),
  (gen_random_uuid(), 'NOK', 'Corona noruega', 'kr', 'Noruega', true, 18),
  (gen_random_uuid(), 'DKK', 'Corona danesa', 'kr', 'Dinamarca', true, 19),
  (gen_random_uuid(), 'PLN', 'Zloty polaco', 'zł', 'Polonia', true, 20),
  (gen_random_uuid(), 'CZK', 'Corona checa', 'Kč', 'República Checa', true, 21),
  (gen_random_uuid(), 'HUF', 'Florín húngaro', 'Ft', 'Hungría', true, 22),
  (gen_random_uuid(), 'TRY', 'Lira turca', '₺', 'Turquía', true, 23),
  (gen_random_uuid(), 'RUB', 'Rublo ruso', '₽', 'Rusia', true, 24),
  (gen_random_uuid(), 'INR', 'Rupia india', '₹', 'India', true, 25),
  (gen_random_uuid(), 'TWD', 'Dólar taiwanés', 'NT$', 'Taiwán', true, 26),
  (gen_random_uuid(), 'THB', 'Baht tailandés', '฿', 'Tailandia', true, 27),
  (gen_random_uuid(), 'SGD', 'Dólar de Singapur', '$', 'Singapur', true, 28),
  (gen_random_uuid(), 'HKD', 'Dólar de Hong Kong', 'HK$', 'Hong Kong', true, 29),
  (gen_random_uuid(), 'ZAR', 'Rand sudafricano', 'R', 'Sudáfrica', true, 30),
  (gen_random_uuid(), 'ILS', 'Nuevo shekel israelí', '₪', 'Israel', true, 31),
  (gen_random_uuid(), 'SAR', 'Riyal saudí', 'ر.س', 'Arabia Saudita', true, 32),
  (gen_random_uuid(), 'AED', 'Dirham de EAU', 'د.إ', 'Emiratos Árabes Unidos', true, 33),
  (gen_random_uuid(), 'MYR', 'Ringgit malayo', 'RM', 'Malasia', true, 34),
  (gen_random_uuid(), 'PHP', 'Peso filipino', '₱', 'Filipinas', true, 35),
  (gen_random_uuid(), 'IDR', 'Rupia indonesia', 'Rp', 'Indonesia', true, 36),
  (gen_random_uuid(), 'VND', 'Dong vietnamita', '₫', 'Vietnam', true, 37),
  (gen_random_uuid(), 'UYU', 'Peso uruguayo', '$U', 'Uruguay', true, 38),
  (gen_random_uuid(), 'GTQ', 'Quetzal guatemalteco', 'Q', 'Guatemala', true, 39),
  (gen_random_uuid(), 'PAB', 'Balboa panameño', 'B/.', 'Panamá', true, 40),
  (gen_random_uuid(), 'DOP', 'Peso dominicano', 'RD$', 'República Dominicana', true, 41),
  (gen_random_uuid(), 'CRC', 'Colón costarricense', '₡', 'Costa Rica', true, 42),
  (gen_random_uuid(), 'BOB', 'Boliviano', 'Bs.', 'Bolivia', true, 43),
  (gen_random_uuid(), 'PYG', 'Guaraní paraguayo', '₲', 'Paraguay', true, 44)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 8. TAXES (Apendice 12: Contribuciones, cuotas compensatorias, derechos)
-- =============================================================================
INSERT INTO anexo22_taxes (id, code, description, abbreviation, tax_type, is_active, sort_order) VALUES
  (gen_random_uuid(), 'DTA', 'Derecho de Trámite Aduanero', 'DTA', 'duty', true, 1),
  (gen_random_uuid(), 'IGI', 'Impuesto General de Importación', 'IGI', 'tax', true, 2),
  (gen_random_uuid(), 'IGE', 'Impuesto General de Exportación', 'IGE', 'tax', true, 3),
  (gen_random_uuid(), 'IVA', 'Impuesto al Valor Agregado', 'IVA', 'tax', true, 4),
  (gen_random_uuid(), 'IEPS', 'Impuesto Especial sobre Producción y Servicios', 'IEPS', 'tax', true, 5),
  (gen_random_uuid(), 'ISAN', 'Impuesto sobre Automóviles Nuevos', 'ISAN', 'tax', true, 6),
  (gen_random_uuid(), 'CC', 'Cuota Compensatoria', 'CC', 'compensatory', true, 7),
  (gen_random_uuid(), 'PRV', 'Prevalidación electrónica', 'PRV', 'fee', true, 8),
  (gen_random_uuid(), 'CNT', 'Contraprestación', 'CNT', 'fee', true, 9),
  (gen_random_uuid(), 'MUL', 'Multas', 'MUL', 'penalty', true, 10),
  (gen_random_uuid(), 'REC', 'Recargos', 'REC', 'penalty', true, 11),
  (gen_random_uuid(), 'ACT', 'Actualización', 'ACT', 'penalty', true, 12),
  (gen_random_uuid(), 'OTR', 'Otros derechos y aprovechamientos', 'OTR', 'other', true, 13)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 9. IDENTIFIERS (Apendice 8: Identificadores a nivel pedimento y partida)
-- =============================================================================
INSERT INTO anexo22_identifiers (id, code, description, level, complement, is_active, sort_order) VALUES
  (gen_random_uuid(), 'AM', 'Amparo', 'pedimento', 'Número de amparo', true, 1),
  (gen_random_uuid(), 'AV', 'Aviso automático de importación', 'partida', 'Número del aviso', true, 2),
  (gen_random_uuid(), 'CB', 'Cuenta aduanera de garantía por contribuciones', 'pedimento', 'Número de constancia', true, 3),
  (gen_random_uuid(), 'CI', 'Acuerdo de la OIC', 'pedimento', 'Número del acuerdo', true, 4),
  (gen_random_uuid(), 'CO', 'Certificado de origen', 'partida', 'Número del certificado', true, 5),
  (gen_random_uuid(), 'CT', 'Cuenta aduanera para el pago de las cuotas compensatorias', 'pedimento', 'Número de constancia', true, 6),
  (gen_random_uuid(), 'DU', 'Documento mediante el cual se determina la contribución', 'pedimento', 'Número de documento', true, 7),
  (gen_random_uuid(), 'ED', 'Identificador para exportadores autorizados', 'pedimento', 'Número de autorización', true, 8),
  (gen_random_uuid(), 'EM', 'Empresas de la industria automotriz terminal', 'pedimento', 'Registro de empresa', true, 9),
  (gen_random_uuid(), 'EN', 'Registro de empresa PROSEC', 'pedimento', 'Número de registro', true, 10),
  (gen_random_uuid(), 'EP', 'Registro de empresa de la industria electrónica', 'pedimento', 'Número de registro', true, 11),
  (gen_random_uuid(), 'EX', 'Regulación de exportación', 'partida', 'Número de autorización', true, 12),
  (gen_random_uuid(), 'FI', 'Fideicomiso', 'pedimento', 'Número de fideicomiso', true, 13),
  (gen_random_uuid(), 'FZ', 'Franja o región fronteriza', 'pedimento', 'Zona aplicable', true, 14),
  (gen_random_uuid(), 'GP', 'Garantía otorgada al fisco federal por cuenta del contribuyente', 'pedimento', 'Número de garantía', true, 15),
  (gen_random_uuid(), 'GU', 'Garantía por créditos fiscales', 'pedimento', 'Número de garantía', true, 16),
  (gen_random_uuid(), 'IM', 'Programa IMMEX', 'pedimento', 'Número del programa IMMEX', true, 17),
  (gen_random_uuid(), 'IN', 'Candados oficiales', 'pedimento', 'Número de candado', true, 18),
  (gen_random_uuid(), 'IS', 'Certificación en materia de IVA e IEPS', 'pedimento', 'Número de autorización', true, 19),
  (gen_random_uuid(), 'MC', 'Maquiladora o IMMEX por capacidad ociosa', 'pedimento', 'Número de programa', true, 20),
  (gen_random_uuid(), 'MQ', 'Tipo de mercancía', 'partida', 'Clave del tipo de mercancía', true, 21),
  (gen_random_uuid(), 'NM', 'Norma oficial mexicana de emergencia', 'partida', 'Número de la NOM', true, 22),
  (gen_random_uuid(), 'OA', 'Operador autorizado (OEA)', 'pedimento', 'Número de autorización OEA', true, 23),
  (gen_random_uuid(), 'PA', 'Programa de devolución de aranceles (Drawback)', 'pedimento', 'Número de resolución', true, 24),
  (gen_random_uuid(), 'PE', 'Permiso de importación o exportación', 'partida', 'Número de permiso', true, 25),
  (gen_random_uuid(), 'PM', 'Permiso de importación de la SEDENA', 'partida', 'Número de permiso', true, 26),
  (gen_random_uuid(), 'PR', 'Programa PROSEC', 'pedimento', 'Número de decreto PROSEC', true, 27),
  (gen_random_uuid(), 'RE', 'Regulación o restricción no arancelaria de exportación', 'partida', 'Número de autorización', true, 28),
  (gen_random_uuid(), 'RM', 'Resolución de la autoridad administrativa o jurisdiccional', 'pedimento', 'Número de resolución', true, 29),
  (gen_random_uuid(), 'SA', 'SAAI (pedimento de servicio)', 'pedimento', 'Número de autorización', true, 30),
  (gen_random_uuid(), 'SG', 'Mercancías de seguridad nacional', 'partida', 'Número de permiso', true, 31),
  (gen_random_uuid(), 'TL', 'Tratado de Libre Comercio', 'partida', 'Clave del tratado', true, 32),
  (gen_random_uuid(), 'VU', 'Vehículos usados', 'partida', 'Número de serie del vehículo', true, 33),
  (gen_random_uuid(), 'DR', 'Programa de Diferimiento de Aranceles', 'pedimento', 'Número de resolución', true, 34),
  (gen_random_uuid(), 'FC', 'Firma electrónica del agente aduanal', 'pedimento', 'Firma electrónica', true, 35),
  (gen_random_uuid(), 'II', 'Código de barras del pedimento', 'pedimento', 'Código de barras', true, 36),
  (gen_random_uuid(), 'NC', 'Número de serie del certificado digital', 'pedimento', 'Número de serie', true, 37)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 10. RRNA (Apendice 9: Regulaciones y restricciones no arancelarias)
-- =============================================================================
INSERT INTO anexo22_rrna (id, code, description, issuing_authority, regulation_type, is_active, sort_order) VALUES
  (gen_random_uuid(), 'NOM', 'Norma Oficial Mexicana', 'Dependencia normalizadora competente', 'technical', true, 1),
  (gen_random_uuid(), 'PERM', 'Permiso previo de importación o exportación', 'Secretaría de Economía', 'permit', true, 2),
  (gen_random_uuid(), 'CUPO', 'Cupo de importación o exportación', 'Secretaría de Economía', 'quota', true, 3),
  (gen_random_uuid(), 'ACCO', 'Arancel-cupo', 'Secretaría de Economía', 'tariff_quota', true, 4),
  (gen_random_uuid(), 'CI', 'Certificado de inspección', 'Autoridad competente', 'certificate', true, 5),
  (gen_random_uuid(), 'CFITO', 'Certificado fitosanitario', 'SENASICA / SADER', 'phytosanitary', true, 6),
  (gen_random_uuid(), 'CZOO', 'Certificado zoosanitario', 'SENASICA / SADER', 'zoosanitary', true, 7),
  (gen_random_uuid(), 'CSAN', 'Certificado sanitario', 'COFEPRIS / Secretaría de Salud', 'sanitary', true, 8),
  (gen_random_uuid(), 'AVIS', 'Aviso automático de importación', 'Secretaría de Economía', 'notice', true, 9),
  (gen_random_uuid(), 'HOJA', 'Hoja de requisitos fitosanitarios', 'SENASICA / SADER', 'phytosanitary', true, 10),
  (gen_random_uuid(), 'CITES', 'Convención sobre el Comercio Internacional de Especies Amenazadas de Fauna y Flora Silvestres', 'SEMARNAT', 'environmental', true, 11),
  (gen_random_uuid(), 'PSEMA', 'Permiso SEMARNAT para materiales y residuos peligrosos', 'SEMARNAT', 'environmental', true, 12),
  (gen_random_uuid(), 'PSED', 'Permiso SEDENA para armas, municiones y explosivos', 'Secretaría de la Defensa Nacional', 'security', true, 13),
  (gen_random_uuid(), 'RSANI', 'Registro sanitario', 'COFEPRIS / Secretaría de Salud', 'sanitary', true, 14),
  (gen_random_uuid(), 'ETIQ', 'Cumplimiento de etiquetado', 'PROFECO / Dependencia competente', 'labeling', true, 15),
  (gen_random_uuid(), 'CFIS', 'Certificado de libre venta o análisis', 'Autoridad sanitaria del país de origen', 'certificate', true, 16),
  (gen_random_uuid(), 'PESC', 'Permiso de pesca', 'CONAPESCA / SADER', 'permit', true, 17),
  (gen_random_uuid(), 'CSENA', 'Certificado SENASICA para productos acuícolas y pesqueros', 'SENASICA / SADER', 'zoosanitary', true, 18),
  (gen_random_uuid(), 'INSEC', 'Inspección ocular', 'Autoridad competente', 'inspection', true, 19),
  (gen_random_uuid(), 'INEGI', 'Dictamen de clasificación INEGI', 'INEGI', 'statistical', true, 20)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 11. PAYMENT METHODS (Apendice 11: Formas de pago)
-- =============================================================================
INSERT INTO anexo22_payment_methods (id, code, description, is_active, sort_order) VALUES
  (gen_random_uuid(), '0', 'Sin pago (exentos)', true, 1),
  (gen_random_uuid(), '1', 'Efectivo', true, 2),
  (gen_random_uuid(), '2', 'Firma electrónica avanzada', true, 3),
  (gen_random_uuid(), '3', 'Máquinas registradoras o equipos de cómputo', true, 4),
  (gen_random_uuid(), '4', 'Transferencia electrónica de fondos', true, 5),
  (gen_random_uuid(), '6', 'Cuenta aduanera', true, 6),
  (gen_random_uuid(), '7', 'Compensación', true, 7),
  (gen_random_uuid(), '8', 'Resolución administrativa o judicial', true, 8),
  (gen_random_uuid(), '9', 'Certificados especiales (PROSEC, IMMEX, Drawback)', true, 9),
  (gen_random_uuid(), '10', 'Línea de captura', true, 10),
  (gen_random_uuid(), '11', 'Pago en parcialidades', true, 11),
  (gen_random_uuid(), '12', 'Garantía', true, 12)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 12. CONTAINER TYPES (Apendice 10: Tipos de contenedor - ISO)
-- =============================================================================
INSERT INTO anexo22_container_types (id, code, description, size_code, is_active, sort_order) VALUES
  (gen_random_uuid(), '20GP', 'Contenedor estándar de 20 pies', '20', true, 1),
  (gen_random_uuid(), '40GP', 'Contenedor estándar de 40 pies', '40', true, 2),
  (gen_random_uuid(), '40HC', 'Contenedor high cube de 40 pies', '40', true, 3),
  (gen_random_uuid(), '20RF', 'Contenedor refrigerado de 20 pies', '20', true, 4),
  (gen_random_uuid(), '40RF', 'Contenedor refrigerado de 40 pies', '40', true, 5),
  (gen_random_uuid(), '40RH', 'Contenedor refrigerado high cube de 40 pies', '40', true, 6),
  (gen_random_uuid(), '20OT', 'Contenedor open top de 20 pies', '20', true, 7),
  (gen_random_uuid(), '40OT', 'Contenedor open top de 40 pies', '40', true, 8),
  (gen_random_uuid(), '20FL', 'Contenedor flat rack de 20 pies', '20', true, 9),
  (gen_random_uuid(), '40FL', 'Contenedor flat rack de 40 pies', '40', true, 10),
  (gen_random_uuid(), '20TK', 'Contenedor tanque de 20 pies', '20', true, 11),
  (gen_random_uuid(), '40TK', 'Contenedor tanque de 40 pies', '40', true, 12),
  (gen_random_uuid(), '20PL', 'Contenedor plataforma de 20 pies', '20', true, 13),
  (gen_random_uuid(), '40PL', 'Contenedor plataforma de 40 pies', '40', true, 14),
  (gen_random_uuid(), '45GP', 'Contenedor estándar de 45 pies', '45', true, 15),
  (gen_random_uuid(), '45HC', 'Contenedor high cube de 45 pies', '45', true, 16),
  (gen_random_uuid(), '20VH', 'Contenedor ventilado de 20 pies', '20', true, 17),
  (gen_random_uuid(), '20BU', 'Contenedor bulk (granelero) de 20 pies', '20', true, 18),
  (gen_random_uuid(), '20HT', 'Contenedor hard top de 20 pies', '20', true, 19),
  (gen_random_uuid(), '40HT', 'Contenedor hard top de 40 pies', '40', true, 20),
  (gen_random_uuid(), 'NE', 'No especificado / sin contenedor', NULL, true, 21)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 13. OPERATION TYPES (Apendice 14: Tipos de operacion)
-- =============================================================================
INSERT INTO anexo22_operation_types (id, code, description, is_active, sort_order) VALUES
  (gen_random_uuid(), 'IMP', 'Importación', true, 1),
  (gen_random_uuid(), 'EXP', 'Exportación', true, 2),
  (gen_random_uuid(), 'TRA', 'Tránsito', true, 3),
  (gen_random_uuid(), 'VIR', 'Virtual (traspasos entre empresas IMMEX)', true, 4),
  (gen_random_uuid(), 'DFI', 'Depósito Fiscal', true, 5),
  (gen_random_uuid(), 'RFI', 'Recinto Fiscalizado', true, 6),
  (gen_random_uuid(), 'RFE', 'Recinto Fiscalizado Estratégico', true, 7),
  (gen_random_uuid(), 'REC', 'Rectificación', true, 8)
ON CONFLICT (code) DO NOTHING;

COMMIT;
