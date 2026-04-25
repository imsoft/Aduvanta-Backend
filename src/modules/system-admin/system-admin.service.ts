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

  async getUsageByOrganization(limit: number, offset: number) {
    return this.repository.getUsageByOrganization(limit, offset);
  }

  async listActiveSessions(limit: number, offset: number) {
    return this.repository.listActiveSessions(limit, offset);
  }

  async revokeSession(sessionId: string): Promise<void> {
    return this.repository.revokeSession(sessionId);
  }

  async getBillingSummary() {
    return this.repository.getBillingSummary();
  }

  async listAnnouncements() {
    return this.repository.listAnnouncements();
  }

  async listActiveAnnouncements() {
    return this.repository.listActiveAnnouncements();
  }

  async createAnnouncement(data: {
    title: string;
    body: string;
    level: 'INFO' | 'WARNING' | 'CRITICAL';
    startsAt: Date;
    endsAt?: Date;
    createdById: string;
  }) {
    return this.repository.createAnnouncement(data);
  }

  async updateAnnouncement(
    id: string,
    data: Partial<{
      title: string;
      body: string;
      level: 'INFO' | 'WARNING' | 'CRITICAL';
      isActive: boolean;
      startsAt: Date;
      endsAt: Date | null;
    }>,
  ) {
    return this.repository.updateAnnouncement(id, data);
  }

  async deleteAnnouncement(id: string): Promise<void> {
    return this.repository.deleteAnnouncement(id);
  }

  async addSystemAdmin(userId: string): Promise<void> {
    return this.repository.addSystemAdmin(userId);
  }

  async removeSystemAdmin(userId: string): Promise<void> {
    return this.repository.removeSystemAdmin(userId);
  }
}
