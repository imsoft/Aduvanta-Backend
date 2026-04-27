import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { SystemAdminGuard } from '../../common/guards/system-admin.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator.js';
import { BillingOverridesService } from './billing-overrides.service.js';
import {
  CreateBillingOverrideDto,
  UpdateBillingOverrideDto,
} from './billing-overrides.schema.js';

@Controller('system-admin/billing-overrides')
@UseGuards(AuthGuard, SystemAdminGuard)
export class BillingOverridesController {
  constructor(private readonly service: BillingOverridesService) {}

  @Get()
  @RateLimit('read')
  async listAll() {
    return this.service.listAll();
  }

  @Get('active')
  @RateLimit('read')
  async listActive() {
    return this.service.listActive();
  }

  @Get('organization/:organizationId')
  @RateLimit('read')
  async getByOrganization(@Param('organizationId') organizationId: string) {
    return this.service.getByOrganization(organizationId);
  }

  @Post()
  @RateLimit('mutation')
  async create(
    @Body() dto: CreateBillingOverrideDto,
    @Session() session: ActiveSession,
  ) {
    return this.service.create(dto, session.user.id);
  }

  @Put(':id')
  @RateLimit('mutation')
  async update(@Param('id') id: string, @Body() dto: UpdateBillingOverrideDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RateLimit('mutation')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true };
  }
}
