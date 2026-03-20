import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  CupoLettersRepository,
  type CupoLetterRecord,
  type CupoLetterUsageRecord,
} from './cupo-letters.repository.js';
import type { CreateCupoLetterDto } from './dto/create-cupo-letter.dto.js';
import type { UpdateCupoLetterDto } from './dto/update-cupo-letter.dto.js';
import type { ChangeCupoLetterStatusDto } from './dto/change-cupo-letter-status.dto.js';
import type { RegisterUsageDto } from './dto/register-usage.dto.js';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: ['PARTIALLY_USED', 'FULLY_USED', 'EXPIRED', 'CANCELLED'],
  PARTIALLY_USED: ['FULLY_USED', 'EXPIRED', 'CANCELLED'],
  REJECTED: ['DRAFT'],
};

const EDITABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);

@Injectable()
export class CupoLettersService {
  constructor(
    private readonly repository: CupoLettersRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listCupoLetters(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ letters: CupoLetterRecord[]; total: number }> {
    return this.repository.findByOrganization(organizationId, limit, offset);
  }

  async searchCupoLetters(
    organizationId: string,
    query: string,
    status: string | undefined,
    type: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ letters: CupoLetterRecord[]; total: number }> {
    return this.repository.search(
      organizationId,
      query,
      status,
      type,
      limit,
      offset,
    );
  }

  async getCupoLetterById(
    id: string,
    organizationId: string,
  ): Promise<CupoLetterRecord> {
    const letter = await this.repository.findByIdAndOrg(id, organizationId);
    if (!letter) {
      throw new NotFoundException(`CUPO letter ${id} not found`);
    }
    return letter;
  }

  async getCupoLetterDetails(id: string, organizationId: string) {
    const letter = await this.getCupoLetterById(id, organizationId);
    const usages = await this.repository.findUsagesByCupoLetter(id);
    return { ...letter, usages };
  }

  async createCupoLetter(
    dto: CreateCupoLetterDto,
    actorId: string,
    organizationId: string,
  ): Promise<CupoLetterRecord> {
    const letter = await this.repository.insertCupoLetter({
      organizationId,
      type: dto.type as 'TARIFF_RATE_QUOTA',
      letterNumber: dto.letterNumber,
      folio: dto.folio,
      clientId: dto.clientId,
      importerRfc: dto.importerRfc,
      importerName: dto.importerName,
      tariffFraction: dto.tariffFraction,
      productDescription: dto.productDescription,
      countryOfOrigin: dto.countryOfOrigin,
      tradeAgreement: dto.tradeAgreement,
      authorizedQuantity: dto.authorizedQuantity,
      remainingQuantity: dto.authorizedQuantity,
      unitOfMeasure: dto.unitOfMeasure,
      preferentialTariffRate: dto.preferentialTariffRate,
      normalTariffRate: dto.normalTariffRate,
      issuingAuthority: dto.issuingAuthority,
      issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
      effectiveDate: dto.effectiveDate
        ? new Date(dto.effectiveDate)
        : undefined,
      expirationDate: dto.expirationDate
        ? new Date(dto.expirationDate)
        : undefined,
      seReferenceNumber: dto.seReferenceNumber,
      observations: dto.observations,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUPO_LETTER_CREATED,
      resource: 'cupo_letter',
      resourceId: letter.id,
      metadata: {
        type: letter.type,
        productDescription: letter.productDescription,
      },
    });

    return letter;
  }

  async updateCupoLetter(
    id: string,
    dto: UpdateCupoLetterDto,
    actorId: string,
    organizationId: string,
  ): Promise<CupoLetterRecord> {
    const letter = await this.getCupoLetterById(id, organizationId);

    if (!EDITABLE_STATUSES.has(letter.status)) {
      throw new BadRequestException(
        `Cannot edit CUPO letter in status ${letter.status}`,
      );
    }

    const updateData: Record<string, unknown> = {};
    if (dto.letterNumber) updateData.letterNumber = dto.letterNumber;
    if (dto.folio) updateData.folio = dto.folio;
    if (dto.importerRfc) updateData.importerRfc = dto.importerRfc;
    if (dto.importerName) updateData.importerName = dto.importerName;
    if (dto.tariffFraction) updateData.tariffFraction = dto.tariffFraction;
    if (dto.productDescription)
      updateData.productDescription = dto.productDescription;
    if (dto.countryOfOrigin) updateData.countryOfOrigin = dto.countryOfOrigin;
    if (dto.tradeAgreement) updateData.tradeAgreement = dto.tradeAgreement;
    if (dto.preferentialTariffRate)
      updateData.preferentialTariffRate = dto.preferentialTariffRate;
    if (dto.normalTariffRate)
      updateData.normalTariffRate = dto.normalTariffRate;
    if (dto.issuingAuthority)
      updateData.issuingAuthority = dto.issuingAuthority;
    if (dto.issueDate) updateData.issueDate = new Date(dto.issueDate);
    if (dto.effectiveDate)
      updateData.effectiveDate = new Date(dto.effectiveDate);
    if (dto.expirationDate)
      updateData.expirationDate = new Date(dto.expirationDate);
    if (dto.seReferenceNumber)
      updateData.seReferenceNumber = dto.seReferenceNumber;
    if (dto.observations) updateData.observations = dto.observations;

    const updated = await this.repository.updateCupoLetter(
      id,
      updateData as Partial<
        typeof import('../../database/schema/index.js').cupoLetters.$inferInsert
      >,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUPO_LETTER_UPDATED,
      resource: 'cupo_letter',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async changeCupoLetterStatus(
    id: string,
    dto: ChangeCupoLetterStatusDto,
    actorId: string,
    organizationId: string,
  ): Promise<CupoLetterRecord> {
    const letter = await this.getCupoLetterById(id, organizationId);

    const allowed = STATUS_TRANSITIONS[letter.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${letter.status} to ${dto.status}`,
      );
    }

    const updated = await this.repository.updateCupoLetter(id, {
      status: dto.status as 'DRAFT',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUPO_LETTER_STATUS_CHANGED,
      resource: 'cupo_letter',
      resourceId: id,
      metadata: {
        previousStatus: letter.status,
        newStatus: dto.status,
      },
    });

    return updated;
  }

  async deleteCupoLetter(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const letter = await this.getCupoLetterById(id, organizationId);
    await this.repository.deleteCupoLetter(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUPO_LETTER_DELETED,
      resource: 'cupo_letter',
      resourceId: id,
      metadata: {
        letterNumber: letter.letterNumber,
        productDescription: letter.productDescription,
      },
    });
  }

  // ========== Usages ==========

  async listUsages(
    cupoLetterId: string,
    organizationId: string,
  ): Promise<CupoLetterUsageRecord[]> {
    await this.getCupoLetterById(cupoLetterId, organizationId);
    return this.repository.findUsagesByCupoLetter(cupoLetterId);
  }

  async registerUsage(
    cupoLetterId: string,
    dto: RegisterUsageDto,
    actorId: string,
    organizationId: string,
  ): Promise<CupoLetterUsageRecord> {
    const letter = await this.getCupoLetterById(cupoLetterId, organizationId);

    const activeStatuses = new Set(['APPROVED', 'PARTIALLY_USED']);
    if (!activeStatuses.has(letter.status)) {
      throw new BadRequestException(
        `Cannot register usage on CUPO letter in status ${letter.status}`,
      );
    }

    const quantityUsed = parseFloat(dto.quantityUsed);
    const currentRemaining = parseFloat(letter.remainingQuantity);

    if (quantityUsed > currentRemaining) {
      throw new BadRequestException(
        `Quantity ${quantityUsed} exceeds remaining balance ${currentRemaining}`,
      );
    }

    const usage = await this.repository.insertUsage({
      cupoLetterId,
      entryId: dto.entryId,
      pedimentoNumber: dto.pedimentoNumber,
      shipmentId: dto.shipmentId,
      quantityUsed: dto.quantityUsed,
      unitOfMeasure: dto.unitOfMeasure,
      usageDate: dto.usageDate ? new Date(dto.usageDate) : new Date(),
      observations: dto.observations,
      createdById: actorId,
    });

    await this.recalculateUsage(cupoLetterId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUPO_LETTER_USAGE_REGISTERED,
      resource: 'cupo_letter_usage',
      resourceId: usage.id,
      metadata: {
        cupoLetterId,
        quantityUsed: dto.quantityUsed,
        pedimentoNumber: dto.pedimentoNumber,
      },
    });

    return usage;
  }

  async deleteUsage(
    cupoLetterId: string,
    usageId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    await this.getCupoLetterById(cupoLetterId, organizationId);

    const usage = await this.repository.findUsageById(usageId);
    if (!usage || usage.cupoLetterId !== cupoLetterId) {
      throw new NotFoundException(`Usage ${usageId} not found in CUPO letter`);
    }

    await this.repository.deleteUsage(usageId);
    await this.recalculateUsage(cupoLetterId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUPO_LETTER_USAGE_DELETED,
      resource: 'cupo_letter_usage',
      resourceId: usageId,
      metadata: {
        cupoLetterId,
        quantityUsed: usage.quantityUsed,
      },
    });
  }

  private async recalculateUsage(cupoLetterId: string): Promise<void> {
    const letter = await this.repository.findByIdAndOrg(cupoLetterId, '');
    if (!letter) return;

    const usages = await this.repository.findUsagesByCupoLetter(cupoLetterId);

    const totalUsed = usages.reduce(
      (sum, u) => sum + parseFloat(u.quantityUsed),
      0,
    );
    const authorized = parseFloat(letter.authorizedQuantity);
    const remaining = authorized - totalUsed;

    let status = letter.status;
    if (totalUsed >= authorized) {
      status = 'FULLY_USED';
    } else if (totalUsed > 0) {
      status = 'PARTIALLY_USED';
    } else if (letter.status === 'PARTIALLY_USED') {
      status = 'APPROVED';
    }

    await this.repository.updateCupoLetter(cupoLetterId, {
      usedQuantity: totalUsed.toFixed(4),
      remainingQuantity: remaining.toFixed(4),
      status: status as 'DRAFT',
    });
  }
}
