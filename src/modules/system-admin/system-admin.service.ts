import { Injectable } from '@nestjs/common';
import { SystemAdminRepository } from './system-admin.repository.js';

@Injectable()
export class SystemAdminService {
  constructor(private readonly repository: SystemAdminRepository) {}

  async isSystemAdmin(userId: string): Promise<boolean> {
    return this.repository.isSystemAdmin(userId);
  }

  async getPlatformOverview() {
    return this.repository.getPlatformOverview();
  }

  async listAllOrganizations(limit: number, offset: number) {
    return this.repository.listAllOrganizations(limit, offset);
  }

  async listAllUsers(limit: number, offset: number, search?: string) {
    return this.repository.listAllUsers(limit, offset, search);
  }

  async listAllEntries(limit: number, offset: number, search?: string) {
    return this.repository.listAllEntries(limit, offset, search);
  }

  async listAllOperations(limit: number, offset: number) {
    return this.repository.listAllOperations(limit, offset);
  }

  async listAllAuditLogs(limit: number, offset: number) {
    return this.repository.listAllAuditLogs(limit, offset);
  }

  async listAllFeatureFlags() {
    return this.repository.listAllFeatureFlags();
  }

  async setFeatureFlag(key: string, isEnabled: boolean, organizationId?: string): Promise<void> {
    return this.repository.setFeatureFlag(key, isEnabled, organizationId);
  }

  async addSystemAdmin(userId: string): Promise<void> {
    return this.repository.addSystemAdmin(userId);
  }

  async removeSystemAdmin(userId: string): Promise<void> {
    return this.repository.removeSystemAdmin(userId);
  }
}
