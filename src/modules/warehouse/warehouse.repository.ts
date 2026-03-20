import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  warehouses,
  warehouseZones,
  warehouseInventory,
  warehouseMovements,
} from '../../database/schema/index.js';

export type WarehouseRecord = typeof warehouses.$inferSelect;
export type ZoneRecord = typeof warehouseZones.$inferSelect;
export type InventoryRecord = typeof warehouseInventory.$inferSelect;
export type MovementRecord = typeof warehouseMovements.$inferSelect;

@Injectable()
export class WarehouseRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Warehouses ---

  async findWarehousesByOrganization(
    organizationId: string,
  ): Promise<WarehouseRecord[]> {
    return this.db
      .select()
      .from(warehouses)
      .where(eq(warehouses.organizationId, organizationId))
      .orderBy(warehouses.name);
  }

  async findWarehouseByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<WarehouseRecord | undefined> {
    const result = await this.db
      .select()
      .from(warehouses)
      .where(
        and(
          eq(warehouses.id, id),
          eq(warehouses.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertWarehouse(
    data: typeof warehouses.$inferInsert,
  ): Promise<WarehouseRecord> {
    const [created] = await this.db.insert(warehouses).values(data).returning();

    return created;
  }

  async updateWarehouse(
    id: string,
    data: Partial<typeof warehouses.$inferInsert>,
  ): Promise<WarehouseRecord> {
    const [updated] = await this.db
      .update(warehouses)
      .set(data)
      .where(eq(warehouses.id, id))
      .returning();

    return updated;
  }

  async deleteWarehouse(id: string): Promise<void> {
    await this.db.delete(warehouses).where(eq(warehouses.id, id));
  }

  // --- Zones ---

  async findZonesByWarehouse(warehouseId: string): Promise<ZoneRecord[]> {
    return this.db
      .select()
      .from(warehouseZones)
      .where(eq(warehouseZones.warehouseId, warehouseId))
      .orderBy(warehouseZones.name);
  }

  async findZoneById(id: string): Promise<ZoneRecord | undefined> {
    const result = await this.db
      .select()
      .from(warehouseZones)
      .where(eq(warehouseZones.id, id))
      .limit(1);

    return result[0];
  }

  async insertZone(
    data: typeof warehouseZones.$inferInsert,
  ): Promise<ZoneRecord> {
    const [created] = await this.db
      .insert(warehouseZones)
      .values(data)
      .returning();

    return created;
  }

  async updateZone(
    id: string,
    data: Partial<typeof warehouseZones.$inferInsert>,
  ): Promise<ZoneRecord> {
    const [updated] = await this.db
      .update(warehouseZones)
      .set(data)
      .where(eq(warehouseZones.id, id))
      .returning();

    return updated;
  }

  async deleteZone(id: string): Promise<void> {
    await this.db.delete(warehouseZones).where(eq(warehouseZones.id, id));
  }

  // --- Inventory ---

  async findInventoryByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: InventoryRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(warehouseInventory)
        .where(eq(warehouseInventory.organizationId, organizationId))
        .orderBy(desc(warehouseInventory.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(warehouseInventory)
        .where(eq(warehouseInventory.organizationId, organizationId)),
    ]);

    return { items: rows, total: countResult[0].count };
  }

  async searchInventory(
    organizationId: string,
    query: string,
    warehouseId: string | undefined,
    status: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ items: InventoryRecord[]; total: number }> {
    const conditions = [
      eq(warehouseInventory.organizationId, organizationId),
      or(
        ilike(warehouseInventory.productDescription, `%${query}%`),
        ilike(warehouseInventory.sku, `%${query}%`),
        ilike(warehouseInventory.pedimentoNumber, `%${query}%`),
        ilike(warehouseInventory.lotNumber, `%${query}%`),
      ),
    ];

    if (warehouseId) {
      conditions.push(eq(warehouseInventory.warehouseId, warehouseId));
    }
    if (status) {
      conditions.push(eq(warehouseInventory.status, status as 'IN_STOCK'));
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(warehouseInventory)
        .where(where)
        .orderBy(desc(warehouseInventory.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(warehouseInventory)
        .where(where),
    ]);

    return { items: rows, total: countResult[0].count };
  }

  async findInventoryByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<InventoryRecord | undefined> {
    const result = await this.db
      .select()
      .from(warehouseInventory)
      .where(
        and(
          eq(warehouseInventory.id, id),
          eq(warehouseInventory.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findInventoryByWarehouse(
    warehouseId: string,
    organizationId: string,
  ): Promise<InventoryRecord[]> {
    return this.db
      .select()
      .from(warehouseInventory)
      .where(
        and(
          eq(warehouseInventory.warehouseId, warehouseId),
          eq(warehouseInventory.organizationId, organizationId),
        ),
      )
      .orderBy(desc(warehouseInventory.createdAt));
  }

  async insertInventoryItem(
    data: typeof warehouseInventory.$inferInsert,
  ): Promise<InventoryRecord> {
    const [created] = await this.db
      .insert(warehouseInventory)
      .values(data)
      .returning();

    return created;
  }

  async updateInventoryItem(
    id: string,
    data: Partial<typeof warehouseInventory.$inferInsert>,
  ): Promise<InventoryRecord> {
    const [updated] = await this.db
      .update(warehouseInventory)
      .set(data)
      .where(eq(warehouseInventory.id, id))
      .returning();

    return updated;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.db
      .delete(warehouseInventory)
      .where(eq(warehouseInventory.id, id));
  }

  // --- Movements ---

  async findMovementsByOrganization(
    organizationId: string,
    warehouseId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ movements: MovementRecord[]; total: number }> {
    const conditions = [eq(warehouseMovements.organizationId, organizationId)];

    if (warehouseId) {
      conditions.push(eq(warehouseMovements.warehouseId, warehouseId));
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(warehouseMovements)
        .where(where)
        .orderBy(desc(warehouseMovements.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(warehouseMovements)
        .where(where),
    ]);

    return { movements: rows, total: countResult[0].count };
  }

  async findMovementByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<MovementRecord | undefined> {
    const result = await this.db
      .select()
      .from(warehouseMovements)
      .where(
        and(
          eq(warehouseMovements.id, id),
          eq(warehouseMovements.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertMovement(
    data: typeof warehouseMovements.$inferInsert,
  ): Promise<MovementRecord> {
    const [created] = await this.db
      .insert(warehouseMovements)
      .values(data)
      .returning();

    return created;
  }

  async updateMovement(
    id: string,
    data: Partial<typeof warehouseMovements.$inferInsert>,
  ): Promise<MovementRecord> {
    const [updated] = await this.db
      .update(warehouseMovements)
      .set(data)
      .where(eq(warehouseMovements.id, id))
      .returning();

    return updated;
  }
}
