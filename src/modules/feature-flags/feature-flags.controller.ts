import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { FeatureFlagsService } from './feature-flags.service.js';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto.js';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto.js';

@Controller('feature-flags')
@UseGuards(AuthGuard, PermissionsGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  @RequirePermission(PERMISSION.FEATURE_FLAGS_READ)
  async list(@Headers('x-organization-id') organizationId: string) {
    return this.featureFlagsService.list(organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.FEATURE_FLAGS_MANAGE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateFeatureFlagDto,
    @Session() session: ActiveSession,
  ) {
    return this.featureFlagsService.create(organizationId, dto, session.user.id);
  }

  @Patch(':flagId')
  @RequirePermission(PERMISSION.FEATURE_FLAGS_MANAGE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('flagId') flagId: string,
    @Body() dto: UpdateFeatureFlagDto,
    @Session() session: ActiveSession,
  ) {
    return this.featureFlagsService.update(
      flagId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete(':flagId')
  @RequirePermission(PERMISSION.FEATURE_FLAGS_MANAGE)
  async delete(
    @Headers('x-organization-id') organizationId: string,
    @Param('flagId') flagId: string,
    @Session() session: ActiveSession,
  ) {
    return this.featureFlagsService.delete(
      flagId,
      organizationId,
      session.user.id,
    );
  }
}
