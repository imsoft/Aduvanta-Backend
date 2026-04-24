import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { customsEntries } from '../../database/schema/customs-entries.schema.js';
import { customsEntryItems } from '../../database/schema/customs-entry-items.schema.js';
import { customsEntryItemTaxes } from '../../database/schema/customs-entry-item-taxes.schema.js';
import { customsEntryParties } from '../../database/schema/customs-entry-parties.schema.js';
import { customsEntryDocuments } from '../../database/schema/customs-entry-documents.schema.js';

// SAAI layout version — based on SAT Reglas Generales de Comercio Exterior
const SAAI_VERSION = '2024';
const REGISTRO_SEPARATOR = '\r\n';

// Fixed-length field padder utilities
const padLeft = (value: string, length: number, char = ' '): string =>
  value.slice(0, length).padStart(length, char);

const padRight = (value: string, length: number, char = ' '): string =>
  value.slice(0, length).padEnd(length, char);

const padNum = (value: number | string | null | undefined, length: number): string =>
  padLeft(String(value ?? '0'), length, '0');

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '        '; // 8 spaces
  const d = typeof date === 'string' ? new Date(date) : date;
  const yyyy = d.getFullYear().toString();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

const formatDecimal = (
  value: string | number | null | undefined,
  intLen: number,
  decLen: number,
): string => {
  const num = parseFloat(String(value ?? '0'));
  const [intPart, decPart = ''] = num.toFixed(decLen).split('.');
  return padLeft(intPart, intLen, '0') + decPart.padEnd(decLen, '0');
};

/**
 * SAAI EDI Layout Generator
 *
 * Generates the SAAI transmission file format for Mexican customs entries (pedimentos).
 * Based on the Anexo 22 layout specification from SAT.
 *
 * Record types:
 *   1 - Encabezado del pedimento (pedimento header)
 *   2 - Contribuciones del pedimento (duties/taxes totals)
 *   3 - Identificadores del pedimento (identifiers)
 *   4 - Destinatario/Remitente (parties)
 *   5 - Partidas (line items)
 *   6 - Contribuciones por partida (item-level taxes)
 *   7 - Identificadores por partida (item-level identifiers)
 *   8 - Documentos (supporting documents)
 *   9 - Observaciones (observations)
 */
@Injectable()
export class SaaiGeneratorService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async generateLayout(
    entryId: string,
    organizationId: string,
  ): Promise<string> {
    // Load entry with all related data
    const [entry] = await this.db
      .select()
      .from(customsEntries)
      .where(eq(customsEntries.id, entryId));

    if (!entry || entry.organizationId !== organizationId) {
      throw new NotFoundException(`Customs entry ${entryId} not found`);
    }

    const [items, parties, documents] = await Promise.all([
      this.db
        .select()
        .from(customsEntryItems)
        .where(eq(customsEntryItems.entryId, entryId)),
      this.db
        .select()
        .from(customsEntryParties)
        .where(eq(customsEntryParties.entryId, entryId)),
      this.db
        .select()
        .from(customsEntryDocuments)
        .where(eq(customsEntryDocuments.entryId, entryId)),
    ]);

    // Load item-level taxes for all items
    const itemIds = items.map((i) => i.id);
    let itemTaxes: (typeof customsEntryItemTaxes.$inferSelect)[] = [];

    if (itemIds.length > 0) {
      const taxPromises = itemIds.map((itemId) =>
        this.db
          .select()
          .from(customsEntryItemTaxes)
          .where(eq(customsEntryItemTaxes.itemId, itemId)),
      );
      const taxResults = await Promise.all(taxPromises);
      itemTaxes = taxResults.flat();
    }

    const records: string[] = [];

    // Record 1: Pedimento header
    records.push(this.buildRecord1(entry));

    // Record 2: Total taxes/duties
    records.push(this.buildRecord2(entry));

    // Record 4: Parties (importer, exporter, etc.)
    for (const party of parties) {
      records.push(this.buildRecord4(party));
    }

    // Record 5 + 6 + 7: Items with taxes and identifiers
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      records.push(this.buildRecord5(item, idx + 1));

      const taxes = itemTaxes.filter((t) => t.itemId === item.id);
      for (const tax of taxes) {
        records.push(this.buildRecord6(tax, idx + 1));
      }
    }

    // Record 8: Documents
    for (const doc of documents) {
      records.push(this.buildRecord8(doc));
    }

    // Record 9: Observations (if any)
    if (entry.observations) {
      records.push(this.buildRecord9(entry.observations));
    }

    return records.join(REGISTRO_SEPARATOR) + REGISTRO_SEPARATOR;
  }

  // Record 1 — Encabezado del pedimento
  private buildRecord1(
    entry: typeof customsEntries.$inferSelect,
  ): string {
    const tipoRegistro = '1'; // 1 char
    const clavePedimento = padRight(entry.entryKey ?? '', 2);
    const tipoCambio = formatDecimal(entry.exchangeRate, 6, 4);
    const valorUsd = formatDecimal(entry.totalCommercialValueUsd, 14, 2);
    const valorAduana = formatDecimal(entry.totalCustomsValueMxn, 14, 2);
    const totalContribuciones = formatDecimal(entry.grandTotal, 14, 2);
    const fechaPago = formatDate(entry.paymentDate);
    const numeroPedimento = padRight(entry.entryNumber ?? '', 15);
    const regimen = padRight(entry.regime ?? '', 3);
    const tipoOperacion = padNum(entry.operationType, 1);
    const puertoEntradaSalida = padRight(entry.customsOfficeId ?? '', 3);
    const vehiculoTransporte = padNum(entry.transportMode, 1);
    const fechaEntrada = formatDate(entry.entryDate);
    const moneda = padRight(entry.invoiceCurrency ?? 'USD', 3);
    const paisOrigen = padRight(entry.originCountry ?? '', 3);
    const paisDestino = padRight(entry.destinationCountry ?? '', 3);
    const rfcImportador = padRight('', 13); // would come from importer party
    const nombreImportador = padRight('', 40);

    return [
      tipoRegistro,
      clavePedimento,
      numeroPedimento,
      regimen,
      tipoOperacion,
      puertoEntradaSalida,
      vehiculoTransporte,
      fechaEntrada,
      fechaPago,
      moneda,
      tipoCambio,
      valorUsd,
      valorAduana,
      totalContribuciones,
      paisOrigen,
      paisDestino,
      rfcImportador,
      nombreImportador,
    ].join('');
  }

  // Record 2 — Contribuciones globales del pedimento
  private buildRecord2(
    entry: typeof customsEntries.$inferSelect,
  ): string {
    const tipoRegistro = '2';
    const totalIGI = formatDecimal(entry.totalDuties, 14, 2);
    const totalIVA = formatDecimal(entry.totalVat, 14, 2);
    const totalDTA = formatDecimal(entry.totalDta, 14, 2);
    const totalOtros = formatDecimal(entry.totalOtherTaxes, 14, 2);
    const gran_total = formatDecimal(entry.grandTotal, 14, 2);

    return [tipoRegistro, totalIGI, totalIVA, totalDTA, totalOtros, gran_total].join('');
  }

  // Record 4 — Parte (destinatario, remitente, etc.)
  private buildRecord4(
    party: typeof customsEntryParties.$inferSelect,
  ): string {
    const tipoRegistro = '4';
    const tipoParte = padRight(party.role ?? '', 2);
    const rfc = padRight(party.taxId ?? '', 13);
    const nombre = padRight(party.name ?? '', 40);
    const domicilio = padRight(party.address ?? '', 50);
    const pais = padRight(party.country ?? '', 3);

    return [tipoRegistro, tipoParte, rfc, nombre, domicilio, pais].join('');
  }

  // Record 5 — Partida (line item)
  private buildRecord5(
    item: typeof customsEntryItems.$inferSelect,
    sequence: number,
  ): string {
    const tipoRegistro = '5';
    const secuencia = padNum(sequence, 3);
    const fraccion = padRight(item.tariffFractionCode ?? '', 8);
    const subdivision = padRight('', 2); // not tracked in current schema
    const descripcion = padRight(item.description ?? '', 80);
    const cantidadUMC = formatDecimal(item.quantity, 14, 3);
    const umc = padRight(item.measurementUnit ?? '', 3);
    const cantidadUMT = formatDecimal(item.quantity, 14, 3); // commercial qty = tariff qty
    const umt = padRight(item.measurementUnit ?? '', 3);
    const valorUSD = formatDecimal(item.commercialValueUsd, 14, 2);
    const valorAduana = formatDecimal(item.customsValueMxn, 14, 2);
    const paisOrigen = padRight(item.originCountry ?? '', 3);
    const marcas = padRight(item.brand ?? '', 40);
    const modelo = padRight(item.model ?? '', 40);
    const serial = padRight(item.serialNumber ?? '', 40);

    return [
      tipoRegistro,
      secuencia,
      fraccion,
      subdivision,
      descripcion,
      cantidadUMC,
      umc,
      cantidadUMT,
      umt,
      valorUSD,
      valorAduana,
      paisOrigen,
      marcas,
      modelo,
      serial,
    ].join('');
  }

  // Record 6 — Contribución por partida
  private buildRecord6(
    tax: typeof customsEntryItemTaxes.$inferSelect,
    itemSequence: number,
  ): string {
    const tipoRegistro = '6';
    const secuenciaPartida = padNum(itemSequence, 3);
    const tipoContribucion = padRight(tax.type ?? '', 3); // IGI, IVA, DTA, etc.
    const baseGravable = formatDecimal(tax.baseAmount, 14, 2);
    const tasaContribucion = formatDecimal(tax.rate, 6, 4);
    const importe = formatDecimal(tax.amount, 14, 2);
    const formaPago = padRight(tax.paymentForm ?? '1', 1); // 1=efectivo, 2=garantia

    return [
      tipoRegistro,
      secuenciaPartida,
      tipoContribucion,
      baseGravable,
      tasaContribucion,
      importe,
      formaPago,
    ].join('');
  }

  // Record 8 — Documento soporte
  private buildRecord8(
    doc: typeof customsEntryDocuments.$inferSelect,
  ): string {
    const tipoRegistro = '8';
    const tipoDocumento = padRight(doc.documentTypeCode ?? '', 2);
    const numeroDocumento = padRight(doc.documentNumber ?? '', 40);
    const fechaDocumento = formatDate(doc.documentDate);
    const paisEmision = padRight(doc.issuedBy ?? '', 3);
    const moneda = padRight('', 3); // currency not tracked per-document
    const valor = formatDecimal(null, 14, 2); // value not tracked per-document

    return [
      tipoRegistro,
      tipoDocumento,
      numeroDocumento,
      fechaDocumento,
      paisEmision,
      moneda,
      valor,
    ].join('');
  }

  // Record 9 — Observaciones
  private buildRecord9(observations: string): string {
    const tipoRegistro = '9';
    const texto = padRight(observations.slice(0, 2500), 2500);
    return tipoRegistro + texto;
  }

  // Validate entry is ready for SAAI transmission
  async validateForTransmission(
    entryId: string,
    organizationId: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const [entry] = await this.db
      .select()
      .from(customsEntries)
      .where(eq(customsEntries.id, entryId));

    if (!entry || entry.organizationId !== organizationId) {
      return { valid: false, errors: ['Entry not found'] };
    }

    const errors: string[] = [];

    if (!entry.entryKey) errors.push('Clave de pedimento es requerida');
    if (!entry.regime) errors.push('Régimen aduanero es requerido');
    if (!entry.operationType) errors.push('Tipo de operación es requerido');
    if (!entry.exchangeRate) errors.push('Tipo de cambio es requerido');
    if (!entry.invoiceCurrency) errors.push('Moneda de factura es requerida');
    if (!entry.originCountry) errors.push('País de origen es requerido');
    if (!entry.totalCustomsValueMxn) errors.push('Valor en aduana es requerido');
    if (!entry.grandTotal) errors.push('Total de contribuciones es requerido');

    const items = await this.db
      .select()
      .from(customsEntryItems)
      .where(eq(customsEntryItems.entryId, entryId));

    if (items.length === 0) {
      errors.push('El pedimento debe tener al menos una partida');
    }

    for (const item of items) {
      if (!item.tariffFractionCode) {
        errors.push(`Partida ${item.itemNumber}: fracción arancelaria es requerida`);
      }
      if (!item.description) {
        errors.push(`Partida ${item.itemNumber}: descripción es requerida`);
      }
      if (!item.originCountry) {
        errors.push(`Partida ${item.itemNumber}: país de origen es requerido`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
