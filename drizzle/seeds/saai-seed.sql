-- =============================================================================
-- SAAI Reference Data Seed
-- Sistema Automatizado Aduanero Integral (Mexican Customs Electronic System)
--
-- This file is idempotent: safe to run multiple times via ON CONFLICT DO NOTHING.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. SAAI Registro Types (M3 document/transaction types)
-- =============================================================================

INSERT INTO saai_registro_types (id, code, name, description, is_active, sort_order, created_at)
VALUES
  (gen_random_uuid(), 301, 'Pedimento Normal', 'Declaracion aduanera estandar para importacion y exportacion de mercancias', true, 1, now()),
  (gen_random_uuid(), 302, 'Desistimiento o Eliminacion', 'Cancelacion o eliminacion de un pedimento previamente validado', true, 2, now()),
  (gen_random_uuid(), 303, 'Informe de la Industria Automotriz', 'Registro especial para operaciones del sector automotriz', true, 3, now()),
  (gen_random_uuid(), 304, 'Pedimento Complementario', 'Pedimento asociado a uno previo para completar la operacion aduanera', true, 4, now()),
  (gen_random_uuid(), 305, 'Previo de Consolidado', 'Registro previo para operaciones de consolidacion de carga', true, 5, now()),
  (gen_random_uuid(), 306, 'Global Complementario', 'Pedimento global complementario para consolidacion de mercancias', true, 6, now()),
  (gen_random_uuid(), 307, 'Transitos', 'Operaciones de transito aduanero interno e internacional', true, 7, now()),
  (gen_random_uuid(), 308, 'Despacho Anticipado', 'Despacho previo al arribo de mercancias al territorio nacional', true, 8, now()),
  (gen_random_uuid(), 309, 'Rectificaciones', 'Correccion de datos en pedimentos previamente validados', true, 9, now()),
  (gen_random_uuid(), 310, 'Confirmacion de Pago', 'Confirmacion del pago de contribuciones al comercio exterior', true, 10, now())
ON CONFLICT (code) DO NOTHING;


-- =============================================================================
-- 2. SAAI Error Codes
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Registro 301 — Pedimento Normal
-- -----------------------------------------------------------------------------

-- Campo 1: Datos generales del pedimento
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 1, 3, 1, 'EN PEDIMENTOS COMPLEMENTARIOS SE EXIGE LA DECLARACION DE UN REGISTRO DE DESCARGOS', true, now()),
  (gen_random_uuid(), 301, 1, 3, 2, 'NO SE PERMITE DECLARAR PRUEBA SUFICIENTE, DETALLE DE IMPORTACION CUANDO SE DECLARO EL CASO SU', true, now()),
  (gen_random_uuid(), 301, 1, 3, 3, 'NO SE PERMITE DECLARAR DETERMINACION DE CONTRIBUCIONES CUANDO SE DECLARA CASO SU', true, now()),
  (gen_random_uuid(), 301, 1, 3, 4, 'EL NUMERO DE PEDIMENTO NO CUMPLE CON EL FORMATO ESTABLECIDO POR EL SAT', true, now()),
  (gen_random_uuid(), 301, 1, 3, 5, 'LA FECHA DE ENTRADA O SALIDA NO PUEDE SER ANTERIOR A LA FECHA DE PAGO', true, now()),
  (gen_random_uuid(), 301, 1, 3, 6, 'EL TIPO DE OPERACION DECLARADO NO CORRESPONDE CON LA CLAVE DE PEDIMENTO', true, now()),
  (gen_random_uuid(), 301, 1, 3, 7, 'NO SE PERMITE DECLARAR MAS DE UN DESTINATARIO EN ESTE TIPO DE PEDIMENTO', true, now()),
  (gen_random_uuid(), 301, 1, 3, 8, 'LA FECHA DE PAGO NO PUEDE SER POSTERIOR A LA FECHA ACTUAL', true, now())
ON CONFLICT DO NOTHING;

-- Campo 2: Patente aduanal
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 2, 3, 1, 'LA CLAVE DE LA PATENTE DECLARADA NO SE ENCUENTRA REGISTRADA EN SAAI M3, REPORTAR A MESA DE AYUDA', true, now()),
  (gen_random_uuid(), 301, 2, 3, 2, 'LA CLAVE DE PATENTE DECLARADA SE ENCUENTRA CANCELADA', true, now()),
  (gen_random_uuid(), 301, 2, 3, 3, 'LA CLAVE DE PATENTE DECLARADA SE ENCUENTRA EN SUSPENSION JURIDICA', true, now()),
  (gen_random_uuid(), 301, 2, 3, 4, 'LA CLAVE DE PATENTE DECLARADA SE ENCUENTRA DADA DE BAJA', true, now()),
  (gen_random_uuid(), 301, 2, 3, 5, 'LA CLAVE DE PATENTE DECLARADA SE ENCUENTRA CON ESTATUS INDETERMINADO, REPORTAR A MESA DE AYUDA', true, now()),
  (gen_random_uuid(), 301, 2, 3, 6, 'LA PATENTE DECLARADA NO TIENE AUTORIZACION PARA OPERAR EN LA ADUANA INDICADA', true, now()),
  (gen_random_uuid(), 301, 2, 3, 7, 'EL AGENTE ADUANAL ASOCIADO A LA PATENTE NO CUENTA CON ENCARGO CONFERIDO VIGENTE', true, now()),
  (gen_random_uuid(), 301, 2, 3, 8, 'LA PATENTE NO TIENE AUTORIZACION PARA EL REGIMEN ADUANERO DECLARADO', true, now()),
  (gen_random_uuid(), 301, 2, 3, 13, 'A LA PATENTE NO SE LE PERMITE LA CLAVE DE DOCUMENTO DECLARADA', true, now()),
  (gen_random_uuid(), 301, 2, 3, 19, 'AGENTE O APODERADO NO ENCONTRADO', true, now()),
  (gen_random_uuid(), 301, 2, 3, 20, 'LA PATENTE DECLARADA NO CORRESPONDE AL TIPO DE DESPACHO SOLICITADO', true, now()),
  (gen_random_uuid(), 301, 2, 3, 21, 'EL NUMERO DE AUTORIZACION DEL APODERADO ADUANAL NO ES VALIDO', true, now())
ON CONFLICT DO NOTHING;

-- Campo 3: Aduana y seccion
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 3, 3, 1, 'LA CLAVE DE ADUANA/SECCION DECLARADA NO EXISTE EN EL CATALOGO DE ADUANAS VIGENTE', true, now()),
  (gen_random_uuid(), 301, 3, 3, 2, 'LA ADUANA DECLARADA SE ENCUENTRA SUSPENDIDA TEMPORALMENTE', true, now()),
  (gen_random_uuid(), 301, 3, 3, 3, 'LA SECCION ADUANERA DECLARADA NO CORRESPONDE A LA ADUANA INDICADA', true, now()),
  (gen_random_uuid(), 301, 3, 3, 4, 'LA ADUANA DECLARADA NO TIENE AUTORIZACION PARA EL TIPO DE TRAFICO INDICADO', true, now()),
  (gen_random_uuid(), 301, 3, 3, 5, 'LA ADUANA DE ENTRADA NO CORRESPONDE CON LA ADUANA DE DESPACHO PARA TRANSITO', true, now()),
  (gen_random_uuid(), 301, 3, 3, 6, 'LA ADUANA DECLARADA NO PERMITE OPERACIONES DE IMPORTACION TEMPORAL', true, now()),
  (gen_random_uuid(), 301, 3, 3, 7, 'LA SECCION ADUANERA NO ESTA HABILITADA PARA EL REGIMEN DECLARADO', true, now())
ON CONFLICT DO NOTHING;

-- Campo 4: Clave de pedimento
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 4, 3, 1, 'LA CLAVE DE PEDIMENTO DECLARADA NO EXISTE EN EL CATALOGO DE CLAVES DE PEDIMENTO', true, now()),
  (gen_random_uuid(), 301, 4, 3, 2, 'LA CLAVE DE PEDIMENTO NO ES APLICABLE AL TIPO DE OPERACION DECLARADO', true, now()),
  (gen_random_uuid(), 301, 4, 3, 3, 'LA CLAVE DE PEDIMENTO DECLARADA SE ENCUENTRA FUERA DE VIGENCIA', true, now()),
  (gen_random_uuid(), 301, 4, 3, 4, 'LA CLAVE DE PEDIMENTO NO ES COMPATIBLE CON EL REGIMEN ADUANERO INDICADO', true, now()),
  (gen_random_uuid(), 301, 4, 3, 5, 'NO SE PERMITE LA CLAVE DE PEDIMENTO V1 SIN DECLARAR CLAVE DE PROGRAMA IMMEX', true, now()),
  (gen_random_uuid(), 301, 4, 3, 6, 'LA CLAVE DE PEDIMENTO A1 NO SE PERMITE PARA IMPORTACIONES TEMPORALES', true, now()),
  (gen_random_uuid(), 301, 4, 3, 7, 'LA COMBINACION DE CLAVE DE PEDIMENTO Y TIPO DE CAMBIO NO ES VALIDA', true, now())
ON CONFLICT DO NOTHING;

-- Campo 5: Tipo de cambio
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 5, 3, 1, 'EL TIPO DE CAMBIO DECLARADO NO CORRESPONDE A LA FECHA DE PAGO DEL PEDIMENTO', true, now()),
  (gen_random_uuid(), 301, 5, 3, 2, 'LA CLAVE DE MONEDA DECLARADA NO EXISTE EN EL CATALOGO DE MONEDAS VIGENTE', true, now()),
  (gen_random_uuid(), 301, 5, 3, 3, 'EL TIPO DE CAMBIO DEBE SER MAYOR A CERO', true, now()),
  (gen_random_uuid(), 301, 5, 3, 4, 'EL TIPO DE CAMBIO DEL DOLAR DECLARADO NO COINCIDE CON EL PUBLICADO POR BANXICO', true, now()),
  (gen_random_uuid(), 301, 5, 3, 5, 'NO SE ENCONTRO TIPO DE CAMBIO PUBLICADO PARA LA FECHA Y MONEDA DECLARADAS', true, now()),
  (gen_random_uuid(), 301, 5, 3, 6, 'LA DIFERENCIA ENTRE EL TIPO DE CAMBIO DECLARADO Y EL OFICIAL EXCEDE LA TOLERANCIA PERMITIDA', true, now())
ON CONFLICT DO NOTHING;

-- Campo 6: RFC del importador/exportador
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 6, 3, 1, 'EL RFC DEL IMPORTADOR/EXPORTADOR NO SE ENCUENTRA EN EL PADRON DE IMPORTADORES', true, now()),
  (gen_random_uuid(), 301, 6, 3, 2, 'EL RFC DEL IMPORTADOR/EXPORTADOR TIENE FORMATO INVALIDO', true, now()),
  (gen_random_uuid(), 301, 6, 3, 3, 'EL RFC DECLARADO SE ENCUENTRA SUSPENDIDO EN EL PADRON DE IMPORTADORES', true, now()),
  (gen_random_uuid(), 301, 6, 3, 4, 'EL RFC DECLARADO ESTA INCLUIDO EN LA LISTA NEGRA DEL SAT (ARTICULO 69-B CFF)', true, now()),
  (gen_random_uuid(), 301, 6, 3, 5, 'EL IMPORTADOR NO CUENTA CON PADRON SECTORIAL PARA LA FRACCION ARANCELARIA DECLARADA', true, now()),
  (gen_random_uuid(), 301, 6, 3, 6, 'EL DOMICILIO FISCAL DEL RFC DECLARADO NO SE ENCUENTRA LOCALIZADO', true, now()),
  (gen_random_uuid(), 301, 6, 3, 7, 'EL RFC DEL EXPORTADOR NO CORRESPONDE CON EL REGISTRO EN EL PADRON DE EXPORTADORES SECTORIAL', true, now()),
  (gen_random_uuid(), 301, 6, 3, 8, 'EL CURP DEL IMPORTADOR PERSONA FISICA NO COINCIDE CON EL RFC DECLARADO', true, now()),
  (gen_random_uuid(), 301, 6, 3, 9, 'EL RFC DEL DESTINATARIO NO SE ENCUENTRA REGISTRADO ANTE EL SAT', true, now()),
  (gen_random_uuid(), 301, 6, 3, 10, 'EL NUMERO DE ID FISCAL DEL PROVEEDOR EN EL EXTRANJERO TIENE FORMATO INVALIDO', true, now())
ON CONFLICT DO NOTHING;

-- Campo 7: Fraccion arancelaria
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 7, 3, 1, 'LA FRACCION ARANCELARIA DECLARADA NO EXISTE EN LA TARIFA VIGENTE (TIGIE)', true, now()),
  (gen_random_uuid(), 301, 7, 3, 2, 'LA FRACCION ARANCELARIA DECLARADA SE ENCUENTRA FUERA DE VIGENCIA', true, now()),
  (gen_random_uuid(), 301, 7, 3, 3, 'LA FRACCION ARANCELARIA REQUIERE PERMISO PREVIO DE IMPORTACION NO DECLARADO', true, now()),
  (gen_random_uuid(), 301, 7, 3, 4, 'LA FRACCION ARANCELARIA NO ES APLICABLE AL TIPO DE OPERACION DECLARADO', true, now()),
  (gen_random_uuid(), 301, 7, 3, 5, 'LA DESCRIPCION DE LA MERCANCIA NO CORRESPONDE CON LA FRACCION ARANCELARIA DECLARADA', true, now()),
  (gen_random_uuid(), 301, 7, 3, 6, 'LA FRACCION ARANCELARIA DECLARADA REQUIERE PADRON SECTORIAL NO REGISTRADO PARA EL RFC', true, now()),
  (gen_random_uuid(), 301, 7, 3, 7, 'LA FRACCION ARANCELARIA ESTA SUJETA A CUOTA COMPENSATORIA NO DECLARADA', true, now()),
  (gen_random_uuid(), 301, 7, 3, 8, 'LA FRACCION ARANCELARIA NO PERMITE IMPORTACION BAJO EL PROGRAMA IMMEX DECLARADO', true, now()),
  (gen_random_uuid(), 301, 7, 3, 9, 'EL ARANCEL PREFERENCIAL DECLARADO NO CORRESPONDE AL TRATADO DE LIBRE COMERCIO INDICADO', true, now())
ON CONFLICT DO NOTHING;

-- Campo 8: Unidad de medida
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 8, 3, 1, 'LA UNIDAD DE MEDIDA DECLARADA NO EXISTE EN EL CATALOGO DE UNIDADES DE MEDIDA', true, now()),
  (gen_random_uuid(), 301, 8, 3, 2, 'LA UNIDAD DE MEDIDA NO CORRESPONDE A LA FRACCION ARANCELARIA DECLARADA', true, now()),
  (gen_random_uuid(), 301, 8, 3, 3, 'LA CANTIDAD EN UNIDAD DE MEDIDA DE TARIFA DEBE SER MAYOR A CERO', true, now()),
  (gen_random_uuid(), 301, 8, 3, 4, 'LA UNIDAD DE MEDIDA COMERCIAL DECLARADA NO ES COMPATIBLE CON LA UNIDAD DE TARIFA', true, now()),
  (gen_random_uuid(), 301, 8, 3, 5, 'EL FACTOR DE CONVERSION ENTRE UNIDAD COMERCIAL Y UNIDAD DE TARIFA ES INCONSISTENTE', true, now()),
  (gen_random_uuid(), 301, 8, 3, 6, 'LA CANTIDAD DECLARADA EXCEDE EL LIMITE PERMITIDO PARA LA FRACCION Y REGIMEN', true, now())
ON CONFLICT DO NOTHING;

-- Campo 9: Pais de origen
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 9, 3, 1, 'LA CLAVE DE PAIS DE ORIGEN NO EXISTE EN EL CATALOGO DE PAISES VIGENTE', true, now()),
  (gen_random_uuid(), 301, 9, 3, 2, 'EL PAIS DE ORIGEN DECLARADO NO CORRESPONDE CON EL CERTIFICADO DE ORIGEN PRESENTADO', true, now()),
  (gen_random_uuid(), 301, 9, 3, 3, 'EL PAIS DE PROCEDENCIA NO PUEDE SER IGUAL AL PAIS DE DESTINO EN OPERACIONES DE TRANSITO', true, now()),
  (gen_random_uuid(), 301, 9, 3, 4, 'EL PAIS DECLARADO TIENE EMBARGO COMERCIAL VIGENTE PARA LA FRACCION ARANCELARIA INDICADA', true, now()),
  (gen_random_uuid(), 301, 9, 3, 5, 'SE REQUIERE CERTIFICADO DE ORIGEN PARA APLICAR TRATO PREFERENCIAL DEL PAIS DECLARADO', true, now()),
  (gen_random_uuid(), 301, 9, 3, 6, 'LA CLAVE DE PAIS DE VENDEDOR NO COINCIDE CON EL PAIS DE ORIGEN DE LA MERCANCIA', true, now())
ON CONFLICT DO NOTHING;

-- Campo 10: Contribuciones e impuestos
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 10, 3, 1, 'EL MONTO DEL IMPUESTO GENERAL DE IMPORTACION (IGI) NO CORRESPONDE CON LA TASA VIGENTE', true, now()),
  (gen_random_uuid(), 301, 10, 3, 2, 'EL CALCULO DEL IVA NO COINCIDE CON LA BASE GRAVABLE DECLARADA', true, now()),
  (gen_random_uuid(), 301, 10, 3, 3, 'LA CUOTA COMPENSATORIA DECLARADA NO CORRESPONDE AL PAIS DE ORIGEN Y FRACCION', true, now()),
  (gen_random_uuid(), 301, 10, 3, 4, 'EL DERECHO DE TRAMITE ADUANERO (DTA) CALCULADO NO COINCIDE CON LA TASA APLICABLE', true, now()),
  (gen_random_uuid(), 301, 10, 3, 5, 'NO SE DECLARO EL IMPUESTO ESPECIAL SOBRE PRODUCCION Y SERVICIOS (IEPS) REQUERIDO', true, now()),
  (gen_random_uuid(), 301, 10, 3, 6, 'LA SUMA DE CONTRIBUCIONES NO COINCIDE CON EL TOTAL DECLARADO EN EL PEDIMENTO', true, now()),
  (gen_random_uuid(), 301, 10, 3, 7, 'NO SE PERMITE EXENCION DE IGI SIN DECLARAR CLAVE DE PROGRAMA O TRATADO APLICABLE', true, now()),
  (gen_random_uuid(), 301, 10, 3, 8, 'EL MONTO DE LA PREVISION POR CONTRIBUCIONES NO PUEDE SER NEGATIVO', true, now()),
  (gen_random_uuid(), 301, 10, 3, 9, 'LA TASA ARANCELARIA PREFERENCIAL NO CORRESPONDE AL ACUERDO COMERCIAL DECLARADO', true, now()),
  (gen_random_uuid(), 301, 10, 3, 10, 'EL APROVECHAMIENTO DECLARADO NO CORRESPONDE A LA CLAVE DE CONTRIBUCION INDICADA', true, now())
ON CONFLICT DO NOTHING;

-- Campo 11: Regulaciones y restricciones no arancelarias (RRNA)
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 11, 3, 1, 'LA FRACCION ARANCELARIA REQUIERE PERMISO PREVIO DE SE (SECRETARIA DE ECONOMIA) NO DECLARADO', true, now()),
  (gen_random_uuid(), 301, 11, 3, 2, 'EL NUMERO DE PERMISO DE IMPORTACION DECLARADO NO SE ENCUENTRA VIGENTE', true, now()),
  (gen_random_uuid(), 301, 11, 3, 3, 'LA NOM DECLARADA NO CORRESPONDE A LA FRACCION ARANCELARIA', true, now()),
  (gen_random_uuid(), 301, 11, 3, 4, 'SE REQUIERE CERTIFICADO FITOSANITARIO DE SENASICA PARA LA FRACCION DECLARADA', true, now()),
  (gen_random_uuid(), 301, 11, 3, 5, 'EL PERMISO DE SEMARNAT DECLARADO NO CUBRE LA MERCANCIA DESCRITA', true, now()),
  (gen_random_uuid(), 301, 11, 3, 6, 'LA CANTIDAD AUTORIZADA EN EL PERMISO PREVIO HA SIDO EXCEDIDA', true, now()),
  (gen_random_uuid(), 301, 11, 3, 7, 'SE REQUIERE CERTIFICADO DE CONFORMIDAD CON NOM NO DECLARADO', true, now()),
  (gen_random_uuid(), 301, 11, 3, 8, 'EL AVISO AUTOMATICO DE IMPORTACION DE SE HA EXPIRADO', true, now()),
  (gen_random_uuid(), 301, 11, 3, 9, 'LA FRACCION REQUIERE AUTORIZACION DE COFEPRIS PARA IMPORTACION', true, now()),
  (gen_random_uuid(), 301, 11, 3, 10, 'EL PERMISO DE SEDENA NO CUBRE EL CALIBRE O TIPO DE MATERIAL DECLARADO', true, now())
ON CONFLICT DO NOTHING;

-- Campo 12: Identificadores (claves de nivel pedimento y partida)
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 12, 3, 1, 'EL IDENTIFICADOR DECLARADO NO EXISTE EN EL CATALOGO DE IDENTIFICADORES VIGENTE', true, now()),
  (gen_random_uuid(), 301, 12, 3, 2, 'EL IDENTIFICADOR ES OBLIGATORIO PARA LA CLAVE DE PEDIMENTO Y FRACCION DECLARADAS', true, now()),
  (gen_random_uuid(), 301, 12, 3, 3, 'EL COMPLEMENTO DEL IDENTIFICADOR TIENE FORMATO INVALIDO', true, now()),
  (gen_random_uuid(), 301, 12, 3, 4, 'NO SE PERMITE DECLARAR EL IDENTIFICADOR EN COMBINACION CON LA CLAVE DE PEDIMENTO', true, now()),
  (gen_random_uuid(), 301, 12, 3, 5, 'EL IDENTIFICADOR DE INMEX REQUIERE NUMERO DE PROGRAMA VALIDO COMO COMPLEMENTO', true, now()),
  (gen_random_uuid(), 301, 12, 3, 6, 'SE REQUIERE IDENTIFICADOR DE TRATADO DE LIBRE COMERCIO PARA APLICAR PREFERENCIA ARANCELARIA', true, now()),
  (gen_random_uuid(), 301, 12, 3, 7, 'EL NUMERO DE REGISTRO DE PROSEC DECLARADO COMO COMPLEMENTO NO ES VALIDO', true, now()),
  (gen_random_uuid(), 301, 12, 3, 8, 'EL IDENTIFICADOR DECLARADO NO APLICA AL NIVEL DE PARTIDA', true, now())
ON CONFLICT DO NOTHING;

-- Campo 13: Valor en aduana
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 13, 3, 1, 'EL VALOR EN ADUANA DECLARADO NO PUEDE SER CERO O NEGATIVO', true, now()),
  (gen_random_uuid(), 301, 13, 3, 2, 'EL METODO DE VALORACION ADUANERA DECLARADO NO ES VALIDO', true, now()),
  (gen_random_uuid(), 301, 13, 3, 3, 'EL VALOR COMERCIAL UNITARIO ESTA FUERA DEL RANGO DE PRECIOS ESTIMADOS PARA LA FRACCION', true, now()),
  (gen_random_uuid(), 301, 13, 3, 4, 'EL VALOR EN ADUANA NO INCLUYE LOS INCREMENTABLES OBLIGATORIOS (FLETES, SEGUROS)', true, now()),
  (gen_random_uuid(), 301, 13, 3, 5, 'LA SUMA DE VALORES COMERCIALES DE LAS PARTIDAS NO COINCIDE CON EL VALOR TOTAL DEL PEDIMENTO', true, now()),
  (gen_random_uuid(), 301, 13, 3, 6, 'SE REQUIERE HOJA DE CALCULO DE VALOR EN ADUANA PARA EL METODO DE VALORACION DECLARADO', true, now()),
  (gen_random_uuid(), 301, 13, 3, 7, 'EL PRECIO UNITARIO DECLARADO ES INFERIOR AL PRECIO ESTIMADO VIGENTE PUBLICADO POR LA SHCP', true, now()),
  (gen_random_uuid(), 301, 13, 3, 8, 'EL VALOR DE FACTURA DECLARADO NO COINCIDE CON EL MONTO DEL COVE ASOCIADO', true, now())
ON CONFLICT DO NOTHING;

-- Campo 14: Datos del transportista
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 14, 3, 1, 'EL RFC O IDENTIFICACION DEL TRANSPORTISTA NO SE ENCUENTRA REGISTRADO', true, now()),
  (gen_random_uuid(), 301, 14, 3, 2, 'EL NUMERO DE CONTENEDOR DECLARADO TIENE FORMATO INVALIDO (ISO 6346)', true, now()),
  (gen_random_uuid(), 301, 14, 3, 3, 'LA CLAVE DE TRANSPORTE DECLARADA NO EXISTE EN EL CATALOGO DE MEDIOS DE TRANSPORTE', true, now()),
  (gen_random_uuid(), 301, 14, 3, 4, 'EL NUMERO DE GUIA O CONOCIMIENTO DE EMBARQUE ES OBLIGATORIO PARA EL MEDIO DE TRANSPORTE', true, now()),
  (gen_random_uuid(), 301, 14, 3, 5, 'EL NUMERO DE CANDADO OFICIAL NO CUMPLE CON EL FORMATO REQUERIDO', true, now()),
  (gen_random_uuid(), 301, 14, 3, 6, 'EL TIPO DE CONTENEDOR DECLARADO NO CORRESPONDE AL MEDIO DE TRANSPORTE', true, now()),
  (gen_random_uuid(), 301, 14, 3, 7, 'SE REQUIERE NUMERO DE MANIFIESTO DE CARGA PARA OPERACIONES MARITIMAS', true, now())
ON CONFLICT DO NOTHING;

-- Campo 15: Documentos anexos y digitalizados
INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 301, 15, 3, 1, 'LA CLAVE DE DOCUMENTO ANEXO NO EXISTE EN EL CATALOGO DE DOCUMENTOS VIGENTE', true, now()),
  (gen_random_uuid(), 301, 15, 3, 2, 'EL NUMERO DE FACTURA DECLARADO COMO DOCUMENTO ANEXO TIENE FORMATO INVALIDO', true, now()),
  (gen_random_uuid(), 301, 15, 3, 3, 'SE REQUIERE DOCUMENTO DE TRANSPORTE (BL, GUIA AEREA, CARTA PORTE) NO DECLARADO', true, now()),
  (gen_random_uuid(), 301, 15, 3, 4, 'EL E-DOCUMENT (COVE) REFERENCIADO NO FUE ENCONTRADO EN EL SISTEMA', true, now()),
  (gen_random_uuid(), 301, 15, 3, 5, 'EL ACUSE DE VALOR ELECTRONICO (COVE) NO CORRESPONDE AL RFC DEL IMPORTADOR', true, now()),
  (gen_random_uuid(), 301, 15, 3, 6, 'SE REQUIERE CERTIFICADO DE ORIGEN PARA LA PREFERENCIA ARANCELARIA DECLARADA', true, now()),
  (gen_random_uuid(), 301, 15, 3, 7, 'EL DOCUMENTO DIGITALIZADO EXCEDE EL TAMANO MAXIMO PERMITIDO', true, now()),
  (gen_random_uuid(), 301, 15, 3, 8, 'EL FORMATO DEL ARCHIVO DIGITALIZADO NO ES VALIDO (SE REQUIERE PDF O TIFF)', true, now())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Registro 304 — Pedimento Complementario
-- -----------------------------------------------------------------------------

INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 304, 1, 3, 1, 'EL PEDIMENTO ORIGINAL REFERENCIADO NO EXISTE EN EL SISTEMA', true, now()),
  (gen_random_uuid(), 304, 1, 3, 2, 'EL PEDIMENTO ORIGINAL NO TIENE ESTATUS DE DESADUANAMIENTO PARA GENERAR COMPLEMENTARIO', true, now()),
  (gen_random_uuid(), 304, 1, 3, 3, 'LA CLAVE DE PEDIMENTO COMPLEMENTARIO NO ES COMPATIBLE CON EL PEDIMENTO ORIGINAL', true, now()),
  (gen_random_uuid(), 304, 2, 3, 1, 'LA PATENTE DEL PEDIMENTO COMPLEMENTARIO DEBE SER LA MISMA DEL PEDIMENTO ORIGINAL', true, now()),
  (gen_random_uuid(), 304, 3, 3, 1, 'LA ADUANA DEL PEDIMENTO COMPLEMENTARIO DEBE COINCIDIR CON LA DEL PEDIMENTO ORIGINAL', true, now()),
  (gen_random_uuid(), 304, 7, 3, 1, 'LA FRACCION ARANCELARIA DEL COMPLEMENTARIO DEBE EXISTIR EN EL PEDIMENTO ORIGINAL', true, now())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Registro 307 — Transitos
-- -----------------------------------------------------------------------------

INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 307, 1, 3, 1, 'LA ADUANA DE INICIO DE TRANSITO NO ESTA HABILITADA PARA OPERACIONES DE TRANSITO', true, now()),
  (gen_random_uuid(), 307, 1, 3, 2, 'LA ADUANA DE DESTINO DE TRANSITO NO ESTA HABILITADA PARA RECIBIR TRANSITOS', true, now()),
  (gen_random_uuid(), 307, 1, 3, 3, 'EL PLAZO DECLARADO PARA EL TRANSITO EXCEDE EL MAXIMO PERMITIDO POR LA RUTA', true, now()),
  (gen_random_uuid(), 307, 1, 3, 4, 'LA RUTA DE TRANSITO DECLARADA NO ES VALIDA PARA LAS ADUANAS DE INICIO Y DESTINO', true, now()),
  (gen_random_uuid(), 307, 14, 3, 1, 'EL TRANSPORTISTA DECLARADO NO CUENTA CON AUTORIZACION PARA TRANSITOS INTERNOS', true, now()),
  (gen_random_uuid(), 307, 14, 3, 2, 'SE REQUIERE NUMERO DE CANDADO OFICIAL PARA OPERACIONES DE TRANSITO', true, now())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Registro 309 — Rectificaciones
-- -----------------------------------------------------------------------------

INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 309, 1, 3, 1, 'EL PEDIMENTO ORIGINAL A RECTIFICAR NO FUE ENCONTRADO EN EL SISTEMA', true, now()),
  (gen_random_uuid(), 309, 1, 3, 2, 'EL PEDIMENTO ORIGINAL YA CUENTA CON EL NUMERO MAXIMO DE RECTIFICACIONES PERMITIDAS', true, now()),
  (gen_random_uuid(), 309, 1, 3, 3, 'NO SE PERMITE RECTIFICACION DE DATOS PORQUE EL PEDIMENTO SE ENCUENTRA EN PROCESO DE GLOSA', true, now()),
  (gen_random_uuid(), 309, 1, 3, 4, 'LA RECTIFICACION MODIFICA DATOS NO PERMITIDOS SEGUN EL ARTICULO 89 DE LA LEY ADUANERA', true, now()),
  (gen_random_uuid(), 309, 1, 3, 5, 'SE REQUIERE AUTORIZACION PREVIA DE LA AUTORIDAD PARA ESTE TIPO DE RECTIFICACION', true, now()),
  (gen_random_uuid(), 309, 6, 3, 1, 'NO SE PERMITE RECTIFICACION DEL RFC DEL IMPORTADOR SIN AUTORIZACION EXPRESA DE LA ADUANA', true, now()),
  (gen_random_uuid(), 309, 7, 3, 1, 'LA RECTIFICACION DE FRACCION ARANCELARIA GENERA DIFERENCIA EN CONTRIBUCIONES QUE DEBE SER PAGADA', true, now())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Registro 305 — Previo de Consolidado
-- -----------------------------------------------------------------------------

INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 305, 1, 3, 1, 'EL NUMERO DE AUTORIZACION DE CONSOLIDACION NO ES VALIDO O HA EXPIRADO', true, now()),
  (gen_random_uuid(), 305, 1, 3, 2, 'LA MERCANCIA DECLARADA NO ESTA AMPARADA POR LA AUTORIZACION DE CONSOLIDACION', true, now()),
  (gen_random_uuid(), 305, 1, 3, 3, 'EL PERIODO DE CONSOLIDACION DECLARADO NO COINCIDE CON EL AUTORIZADO', true, now()),
  (gen_random_uuid(), 305, 6, 3, 1, 'EL RFC DEL IMPORTADOR NO COINCIDE CON EL TITULAR DE LA AUTORIZACION DE CONSOLIDACION', true, now())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Registro 306 — Global Complementario
-- -----------------------------------------------------------------------------

INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 306, 1, 3, 1, 'NO EXISTEN PREVIOS DE CONSOLIDADO PENDIENTES PARA GENERAR EL PEDIMENTO GLOBAL', true, now()),
  (gen_random_uuid(), 306, 1, 3, 2, 'EL PERIODO DEL PEDIMENTO GLOBAL NO CUBRE TODOS LOS PREVIOS DE CONSOLIDADO REGISTRADOS', true, now()),
  (gen_random_uuid(), 306, 1, 3, 3, 'LA SUMA DE VALORES DE LOS PREVIOS NO COINCIDE CON EL VALOR TOTAL DEL GLOBAL COMPLEMENTARIO', true, now()),
  (gen_random_uuid(), 306, 10, 3, 1, 'LAS CONTRIBUCIONES DEL GLOBAL COMPLEMENTARIO NO COINCIDEN CON LA SUMA DE LOS PREVIOS', true, now())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Registro 310 — Confirmacion de Pago
-- -----------------------------------------------------------------------------

INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 310, 1, 3, 1, 'NO SE ENCONTRO REGISTRO DE PAGO EN LA INSTITUCION BANCARIA PARA EL PEDIMENTO DECLARADO', true, now()),
  (gen_random_uuid(), 310, 1, 3, 2, 'EL MONTO PAGADO NO COINCIDE CON EL TOTAL DE CONTRIBUCIONES DEL PEDIMENTO', true, now()),
  (gen_random_uuid(), 310, 1, 3, 3, 'LA FECHA DE PAGO ES ANTERIOR A LA FECHA DE VALIDACION DEL PEDIMENTO', true, now()),
  (gen_random_uuid(), 310, 1, 3, 4, 'EL NUMERO DE OPERACION BANCARIA (LINEA DE CAPTURA) NO ES VALIDO', true, now()),
  (gen_random_uuid(), 310, 1, 3, 5, 'LA INSTITUCION BANCARIA DECLARADA NO ESTA AUTORIZADA PARA RECIBIR PAGOS DE COMERCIO EXTERIOR', true, now())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Registro 308 — Despacho Anticipado
-- -----------------------------------------------------------------------------

INSERT INTO saai_error_codes (id, registro, campo, tipo, numero, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 308, 1, 3, 1, 'EL DESPACHO ANTICIPADO SOLO SE PERMITE PARA MERCANCIAS QUE ARRIBEN POR VIA MARITIMA O AEREA', true, now()),
  (gen_random_uuid(), 308, 1, 3, 2, 'LA MERCANCIA DEL DESPACHO ANTICIPADO NO HA ARRIBADO DENTRO DEL PLAZO ESTABLECIDO', true, now()),
  (gen_random_uuid(), 308, 1, 3, 3, 'EL NUMERO DE MANIFIESTO DE CARGA NO CORRESPONDE AL MEDIO DE TRANSPORTE DECLARADO', true, now()),
  (gen_random_uuid(), 308, 14, 3, 1, 'LA NAVIERA O AEROLINEA DECLARADA NO TIENE REGISTRO EN EL SISTEMA DE MANIFIESTOS', true, now())
ON CONFLICT DO NOTHING;

COMMIT;
