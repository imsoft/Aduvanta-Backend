import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  ImmexProgramsRepository,
  type ImmexProgramRecord,
} from './immex-programs.repository.js';
import type { CreateImmexProgramDto } from './dto/create-immex-program.dto.js';

@Injectable()
export class ImmexProgramsService {
  constructor(
    private readonly repository: ImmexProgramsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listPrograms(
    organizationId: string,
    limit: number,
    offset: number,
    filters: { q?: string; status?: string; clientId?: string } = {},
  ) {
    return this.repository.findByOrganization(
      organizationId,
      limit,
      offset,
      filters,
    );
  }

  async getProgramById(id: string, organizationId: string) {
    const program = await this.repository.findByOrganizationAndId(
      id,
      organizationId,
    );

    if (!program) {
      throw new NotFoundException(`IMMEX program ${id} not found`);
    }

    const [products, machinery] = await Promise.all([
      this.repository.findProductsByProgram(id),
      this.repository.findMachineryByProgram(id),
    ]);

    return { ...program, products, machinery };
  }

  async getExpiringPrograms(organizationId: string, withinDays = 90) {
    return this.repository.findExpiringPrograms(organizationId, withinDays);
  }

  async createProgram(
    dto: CreateImmexProgramDto,
    actorId: string,
    organizationId: string,
  ): Promise<ImmexProgramRecord> {
    const program = await this.repository.insert({
      organizationId,
      clientId: dto.clientId,
      programNumber: dto.programNumber,
      programType: dto.programType,
      rfc: dto.rfc,
      businessName: dto.businessName,
      authorizationDate: dto.authorizationDate,
      expirationDate: dto.expirationDate,
      annualExportCommitmentUsd: dto.annualExportCommitmentUsd,
      renovationAlertDays: dto.renovationAlertDays ?? 90,
      internalNotes: dto.internalNotes,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMMEX_PROGRAM_CREATED,
      resource: 'immex_program',
      resourceId: program.id,
      metadata: {
        programNumber: dto.programNumber,
        programType: dto.programType,
        rfc: dto.rfc,
      },
    });

    return program;
  }

  async updateProgram(
    id: string,
    data: Partial<CreateImmexProgramDto>,
    actorId: string,
    organizationId: string,
  ): Promise<ImmexProgramRecord> {
    await this.getProgramById(id, organizationId);

    const updated = await this.repository.update(id, {
      ...data,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMMEX_PROGRAM_UPDATED,
      resource: 'immex_program',
      resourceId: id,
      metadata: data,
    });

    return updated;
  }

  async addAuthorizedProduct(
    programId: string,
    data: {
      tariffFraction: string;
      description: string;
      unitOfMeasure?: string;
      authorizedQuantity?: string;
      authorizedValueUsd?: string;
    },
    actorId: string,
    organizationId: string,
  ) {
    await this.getProgramById(programId, organizationId);

    const product = await this.repository.insertProduct({
      programId,
      ...data,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMMEX_PROGRAM_UPDATED,
      resource: 'immex_program',
      resourceId: programId,
      metadata: { action: 'product_added', tariffFraction: data.tariffFraction },
    });

    return product;
  }

  async removeAuthorizedProduct(
    programId: string,
    productId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    await this.getProgramById(programId, organizationId);
    await this.repository.deleteProduct(productId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMMEX_PROGRAM_UPDATED,
      resource: 'immex_program',
      resourceId: programId,
      metadata: { action: 'product_removed', productId },
    });
  }

  async addMachinery(
    programId: string,
    data: {
      tariffFraction: string;
      description: string;
      brand?: string;
      model?: string;
      serialNumber?: string;
      quantity?: number;
      entryNumber?: string;
      importDate?: string;
      returnDeadline?: string;
    },
    actorId: string,
    organizationId: string,
  ) {
    await this.getProgramById(programId, organizationId);

    return this.repository.insertMachinery({
      programId,
      tariffFraction: data.tariffFraction,
      description: data.description,
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber,
      quantity: data.quantity ?? 1,
      entryNumber: data.entryNumber,
      importDate: data.importDate,
      returnDeadline: data.returnDeadline,
    });
  }
}
