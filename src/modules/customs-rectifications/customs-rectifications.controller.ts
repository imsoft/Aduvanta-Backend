import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { Session } from '../../common/decorators/session.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { CustomsRectificationsService } from './customs-rectifications.service.js';
import { CreateRectificationDto } from './dto/create-rectification.dto.js';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class ListRectificationsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsString()
  originalEntryId?: string;
}

class ApproveDto {
  @IsString()
  satAcknowledgmentNumber: string;
}

class RejectDto {
  @IsString()
  rejectionReason: string;
}

@Controller('customs-rectifications')
@UseGuards(AuthGuard, PermissionsGuard)
export class CustomsRectificationsController {
  constructor(private readonly service: CustomsRectificationsService) {}

  @Get()
  @RequirePermission(PERMISSION.CUSTOMS_RECTIFICATIONS_READ)
  async list(
    @Query() dto: ListRectificationsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listRectifications(organizationId, limit, offset, {
      originalEntryId: dto.originalEntryId,
    });
  }

  @Get(':id')
  @RequirePermission(PERMISSION.CUSTOMS_RECTIFICATIONS_READ)
  async getById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getRectificationById(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.CUSTOMS_RECTIFICATIONS_CREATE)
  async create(
    @Body() dto: CreateRectificationDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createRectification(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/submit')
  @RequirePermission(PERMISSION.CUSTOMS_RECTIFICATIONS_UPDATE)
  async submit(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.submitRectification(id, session.user.id, organizationId);
  }

  @Post(':id/approve')
  @RequirePermission(PERMISSION.CUSTOMS_RECTIFICATIONS_UPDATE)
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.approveRectification(
      id,
      dto.satAcknowledgmentNumber,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/reject')
  @RequirePermission(PERMISSION.CUSTOMS_RECTIFICATIONS_UPDATE)
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.rejectRectification(
      id,
      dto.rejectionReason,
      session.user.id,
      organizationId,
    );
  }
}
