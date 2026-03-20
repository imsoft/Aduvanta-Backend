import { Inject, Injectable } from '@nestjs/common';
import { eq, sql, and } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  saaiErrorCodes,
  saaiRegistroTypes,
} from '../../database/schema/index.js';

@Injectable()
export class SaaiErrorsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll() {
    return this.db
      .select()
      .from(saaiErrorCodes)
      .where(eq(saaiErrorCodes.isActive, true))
      .orderBy(
        saaiErrorCodes.registro,
        saaiErrorCodes.campo,
        saaiErrorCodes.tipo,
        saaiErrorCodes.numero,
      );
  }

  async findByRegistro(registro: number) {
    return this.db
      .select()
      .from(saaiErrorCodes)
      .where(
        and(
          eq(saaiErrorCodes.isActive, true),
          eq(saaiErrorCodes.registro, registro),
        ),
      )
      .orderBy(
        saaiErrorCodes.campo,
        saaiErrorCodes.tipo,
        saaiErrorCodes.numero,
      );
  }

  async findByKey(
    registro: number,
    campo: number,
    tipo: number,
    numero: number,
  ) {
    const result = await this.db
      .select()
      .from(saaiErrorCodes)
      .where(
        and(
          eq(saaiErrorCodes.registro, registro),
          eq(saaiErrorCodes.campo, campo),
          eq(saaiErrorCodes.tipo, tipo),
          eq(saaiErrorCodes.numero, numero),
        ),
      )
      .limit(1);

    return result[0];
  }

  async search(query: string) {
    const pattern = `%${query}%`;

    return this.db
      .select()
      .from(saaiErrorCodes)
      .where(
        and(
          eq(saaiErrorCodes.isActive, true),
          sql`${saaiErrorCodes.description} ILIKE ${pattern}`,
        ),
      )
      .orderBy(
        saaiErrorCodes.registro,
        saaiErrorCodes.campo,
        saaiErrorCodes.tipo,
        saaiErrorCodes.numero,
      );
  }

  async findAllRegistroTypes() {
    return this.db
      .select()
      .from(saaiRegistroTypes)
      .where(eq(saaiRegistroTypes.isActive, true))
      .orderBy(saaiRegistroTypes.sortOrder, saaiRegistroTypes.code);
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(saaiErrorCodes)
      .where(eq(saaiErrorCodes.isActive, true));

    return result[0].count;
  }
}
