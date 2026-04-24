import {
  Controller,
  Get,
  Post,
  Param,
  Headers,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { SaaiGeneratorService } from './saai-generator.service.js';

@Controller('saai-generator')
@UseGuards(AuthGuard, PermissionsGuard)
export class SaaiGeneratorController {
  constructor(private readonly service: SaaiGeneratorService) {}

  @Get('entries/:entryId/validate')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async validateEntry(
    @Param('entryId') entryId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.validateForTransmission(entryId, organizationId);
  }

  @Post('entries/:entryId/generate')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async generateLayout(
    @Param('entryId') entryId: string,
    @Headers('x-organization-id') organizationId: string,
    @Res() res: Response,
  ) {
    const layout = await this.service.generateLayout(entryId, organizationId);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pedimento-${entryId}.txt"`,
    );
    res.send(layout);
  }
}
