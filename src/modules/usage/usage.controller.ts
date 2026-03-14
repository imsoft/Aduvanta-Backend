import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { UsageService } from './usage.service.js';

@Controller('usage')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  @RequirePermission(PERMISSION.USAGE_READ)
  async getUsage(@Headers('x-organization-id') organizationId: string) {
    return this.usageService.getUsage(organizationId);
  }
}
