import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { systemAdmins } from '../../database/schema/system-admins.schema.js';

@Injectable()
export class SystemAdminRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async isSystemAdmin(userId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: systemAdmins.id })
      .from(systemAdmins)
      .where(eq(systemAdmins.userId, userId))
      .limit(1);

    return rows.length > 0;
  }
}
