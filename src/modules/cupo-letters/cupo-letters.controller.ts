import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { CupoLettersService } from './cupo-letters.service.js';
import { CreateCupoLetterDto } from './dto/create-cupo-letter.dto.js';
import { UpdateCupoLetterDto } from './dto/update-cupo-letter.dto.js';
import { ChangeCupoLetterStatusDto } from './dto/change-cupo-letter-status.dto.js';
import { RegisterUsageDto } from './dto/register-usage.dto.js';
import { ListCupoLettersDto } from './dto/list-cupo-letters.dto.js';
import { SearchCupoLettersDto } from './dto/search-cupo-letters.dto.js';

@Controller('cupo-letters')
@UseGuards(AuthGuard, PermissionsGuard)
export class CupoLettersController {
  constructor(private readonly service: CupoLettersService) {}

  @Get()
  @RequirePermission(PERMISSION.CUPO_LETTERS_READ)
  async listCupoLetters(
    @Query() dto: ListCupoLettersDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listCupoLetters(organizationId, limit, offset);
  }

  @Get('search')
  @RequirePermission(PERMISSION.CUPO_LETTERS_SEARCH)
  async searchCupoLetters(
    @Query() dto: SearchCupoLettersDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.searchCupoLetters(
      organizationId,
      dto.q,
      dto.status,
      dto.type,
      limit,
      offset,
    );
  }

  @Get(':id')
  @RequirePermission(PERMISSION.CUPO_LETTERS_READ)
  async getCupoLetterById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getCupoLetterDetails(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.CUPO_LETTERS_CREATE)
  async createCupoLetter(
    @Body() dto: CreateCupoLetterDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createCupoLetter(dto, session.user.id, organizationId);
  }

  @Patch(':id')
  @RequirePermission(PERMISSION.CUPO_LETTERS_UPDATE)
  async updateCupoLetter(
    @Param('id') id: string,
    @Body() dto: UpdateCupoLetterDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateCupoLetter(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/status')
  @RequirePermission(PERMISSION.CUPO_LETTERS_CHANGE_STATUS)
  async changeCupoLetterStatus(
    @Param('id') id: string,
    @Body() dto: ChangeCupoLetterStatusDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.changeCupoLetterStatus(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id')
  @RequirePermission(PERMISSION.CUPO_LETTERS_DELETE)
  async deleteCupoLetter(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteCupoLetter(id, session.user.id, organizationId);
    return { success: true };
  }

  // ========== Usages ==========

  @Get(':cupoLetterId/usages')
  @RequirePermission(PERMISSION.CUPO_LETTERS_READ)
  async listUsages(
    @Param('cupoLetterId') cupoLetterId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.listUsages(cupoLetterId, organizationId);
  }

  @Post(':cupoLetterId/usages')
  @RequirePermission(PERMISSION.CUPO_LETTERS_REGISTER_USAGE)
  async registerUsage(
    @Param('cupoLetterId') cupoLetterId: string,
    @Body() dto: RegisterUsageDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.registerUsage(
      cupoLetterId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':cupoLetterId/usages/:usageId')
  @RequirePermission(PERMISSION.CUPO_LETTERS_REGISTER_USAGE)
  async deleteUsage(
    @Param('cupoLetterId') cupoLetterId: string,
    @Param('usageId') usageId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteUsage(
      cupoLetterId,
      usageId,
      session.user.id,
      organizationId,
    );
    return { success: true };
  }
}
