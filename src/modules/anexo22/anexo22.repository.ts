import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  anexo22CustomsSections,
  anexo22TransportMeans,
  anexo22PedimentoKeys,
  anexo22CustomsRegimes,
  anexo22UnitsOfMeasure,
  anexo22Countries,
  anexo22Currencies,
  anexo22Taxes,
  anexo22Identifiers,
  anexo22Rrna,
  anexo22PaymentMethods,
  anexo22ContainerTypes,
  anexo22OperationTypes,
} from '../../database/schema/index.js';

const CATALOG_TABLES = {
  customs_sections: anexo22CustomsSections,
  transport_means: anexo22TransportMeans,
  pedimento_keys: anexo22PedimentoKeys,
  customs_regimes: anexo22CustomsRegimes,
  units_of_measure: anexo22UnitsOfMeasure,
  countries: anexo22Countries,
  currencies: anexo22Currencies,
  taxes: anexo22Taxes,
  identifiers: anexo22Identifiers,
  rrna: anexo22Rrna,
  payment_methods: anexo22PaymentMethods,
  container_types: anexo22ContainerTypes,
  operation_types: anexo22OperationTypes,
} as const;

export type CatalogName = keyof typeof CATALOG_TABLES;

export const VALID_CATALOGS = Object.keys(CATALOG_TABLES) as CatalogName[];

@Injectable()
export class Anexo22Repository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(catalogName: CatalogName) {
    const table = CATALOG_TABLES[catalogName];
    return this.db
      .select()
      .from(table)
      .where(eq(table.isActive, true))
      .orderBy(table.sortOrder, table.code);
  }

  async findByCode(catalogName: CatalogName, code: string) {
    const table = CATALOG_TABLES[catalogName];
    const result = await this.db
      .select()
      .from(table)
      .where(eq(table.code, code))
      .limit(1);

    return result[0];
  }

  async search(catalogName: CatalogName, query: string) {
    const table = CATALOG_TABLES[catalogName];
    const textCol = 'description' in table ? 'description' : 'name';
    const pattern = `%${query}%`;

    return this.db
      .select()
      .from(table)
      .where(
        sql`${table.isActive} = true AND (${table.code} ILIKE ${pattern} OR ${sql.identifier(textCol)} ILIKE ${pattern})`,
      )
      .orderBy(table.sortOrder, table.code);
  }

  async count(catalogName: CatalogName): Promise<number> {
    const table = CATALOG_TABLES[catalogName];
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(table)
      .where(eq(table.isActive, true));

    return result[0].count;
  }
}
