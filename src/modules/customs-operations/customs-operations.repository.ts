import { Inject, Injectable } from '@nestjs/common';
import { eq, and, asc, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  shipments,
  shipmentStages,
  shipmentEntries,
  shipmentComments,
  customsEntries,
} from '../../database/schema/index.js';

export type ShipmentRecord = typeof shipments.$inferSelect;
export type ShipmentStageRecord = typeof shipmentStages.$inferSelect;
export type ShipmentEntryRecord = typeof shipmentEntries.$inferSelect;
export type ShipmentCommentRecord = typeof shipmentComments.$inferSelect;

@Injectable()
export class CustomsOperationsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Shipments ---

  async findShipmentsByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ shipments: ShipmentRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(shipments)
        .where(eq(shipments.organizationId, organizationId))
        .orderBy(desc(shipments.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(shipments)
        .where(eq(shipments.organizationId, organizationId)),
    ]);

    return { shipments: rows, total: countResult[0].count };
  }

  async findShipmentByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<ShipmentRecord | undefined> {
    const result = await this.db
      .select()
      .from(shipments)
      .where(
        and(eq(shipments.id, id), eq(shipments.organizationId, organizationId)),
      )
      .limit(1);

    return result[0];
  }

  async insertShipment(
    data: typeof shipments.$inferInsert,
  ): Promise<ShipmentRecord> {
    const [created] = await this.db.insert(shipments).values(data).returning();

    return created;
  }

  async updateShipment(
    id: string,
    data: Partial<typeof shipments.$inferInsert>,
  ): Promise<ShipmentRecord> {
    const [updated] = await this.db
      .update(shipments)
      .set(data)
      .where(eq(shipments.id, id))
      .returning();

    return updated;
  }

  async deleteShipment(id: string): Promise<void> {
    await this.db.delete(shipments).where(eq(shipments.id, id));
  }

  async searchShipments(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ shipments: ShipmentRecord[]; total: number }> {
    const pattern = `%${query}%`;

    const whereClause = and(
      eq(shipments.organizationId, organizationId),
      or(
        ilike(shipments.trackingNumber, pattern),
        ilike(shipments.clientReference, pattern),
        ilike(shipments.clientName, pattern),
        ilike(shipments.billOfLading, pattern),
        ilike(shipments.goodsDescription, pattern),
      ),
    );

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(shipments)
        .where(whereClause)
        .orderBy(desc(shipments.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(shipments)
        .where(whereClause),
    ]);

    return { shipments: rows, total: countResult[0].count };
  }

  // --- Stages ---

  async findStagesByShipment(
    shipmentId: string,
  ): Promise<ShipmentStageRecord[]> {
    return this.db
      .select()
      .from(shipmentStages)
      .where(eq(shipmentStages.shipmentId, shipmentId))
      .orderBy(asc(shipmentStages.startedAt));
  }

  async findStageById(id: string): Promise<ShipmentStageRecord | undefined> {
    const result = await this.db
      .select()
      .from(shipmentStages)
      .where(eq(shipmentStages.id, id))
      .limit(1);

    return result[0];
  }

  async insertStage(
    data: typeof shipmentStages.$inferInsert,
  ): Promise<ShipmentStageRecord> {
    const [created] = await this.db
      .insert(shipmentStages)
      .values(data)
      .returning();

    return created;
  }

  async completeStage(
    id: string,
    completedAt: Date,
  ): Promise<ShipmentStageRecord> {
    const [updated] = await this.db
      .update(shipmentStages)
      .set({ completedAt })
      .where(eq(shipmentStages.id, id))
      .returning();

    return updated;
  }

  // --- Shipment-Entry links ---

  async findEntriesByShipment(shipmentId: string): Promise<
    Array<{
      link: ShipmentEntryRecord;
      entry: typeof customsEntries.$inferSelect;
    }>
  > {
    return this.db
      .select({ link: shipmentEntries, entry: customsEntries })
      .from(shipmentEntries)
      .innerJoin(customsEntries, eq(shipmentEntries.entryId, customsEntries.id))
      .where(eq(shipmentEntries.shipmentId, shipmentId));
  }

  async insertShipmentEntry(
    data: typeof shipmentEntries.$inferInsert,
  ): Promise<ShipmentEntryRecord> {
    const [created] = await this.db
      .insert(shipmentEntries)
      .values(data)
      .returning();

    return created;
  }

  async deleteShipmentEntry(id: string): Promise<void> {
    await this.db.delete(shipmentEntries).where(eq(shipmentEntries.id, id));
  }

  // --- Comments ---

  async findCommentsByShipment(
    shipmentId: string,
  ): Promise<ShipmentCommentRecord[]> {
    return this.db
      .select()
      .from(shipmentComments)
      .where(eq(shipmentComments.shipmentId, shipmentId))
      .orderBy(desc(shipmentComments.createdAt));
  }

  async insertComment(
    data: typeof shipmentComments.$inferInsert,
  ): Promise<ShipmentCommentRecord> {
    const [created] = await this.db
      .insert(shipmentComments)
      .values(data)
      .returning();

    return created;
  }
}
