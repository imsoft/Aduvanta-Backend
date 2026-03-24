import { Injectable } from '@nestjs/common';
import { SystemAdminRepository } from './system-admin.repository.js';

@Injectable()
export class SystemAdminService {
  constructor(private readonly repository: SystemAdminRepository) {}

  async isSystemAdmin(userId: string): Promise<boolean> {
    return this.repository.isSystemAdmin(userId);
  }
}
