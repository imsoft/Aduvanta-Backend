import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { users } from '../../database/schema/index.js';

export type UserRecord = typeof users.$inferSelect;

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findById(id: string): Promise<UserRecord | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0];
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0];
  }

  async updateImage(id: string, imageUrl: string | null): Promise<void> {
    await this.db
      .update(users)
      .set({ image: imageUrl, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}
