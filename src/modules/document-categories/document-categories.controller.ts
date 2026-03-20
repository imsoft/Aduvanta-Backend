import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
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
import { DocumentCategoriesService } from './document-categories.service.js';
import { CreateDocumentCategoryDto } from './dto/create-document-category.dto.js';
import { UpdateDocumentCategoryDto } from './dto/update-document-category.dto.js';

@Controller('document-categories')
@UseGuards(AuthGuard, PermissionsGuard)
export class DocumentCategoriesController {
  constructor(private readonly categoriesService: DocumentCategoriesService) {}

  @Get()
  @RequirePermission(PERMISSION.DOCUMENT_CATEGORIES_READ)
  async list(@Headers('x-organization-id') organizationId: string) {
    return this.categoriesService.list(organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.DOCUMENT_CATEGORIES_CREATE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateDocumentCategoryDto,
    @Session() session: ActiveSession,
  ) {
    return this.categoriesService.create(organizationId, dto, session.user.id);
  }

  @Patch(':categoryId')
  @RequirePermission(PERMISSION.DOCUMENT_CATEGORIES_UPDATE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateDocumentCategoryDto,
    @Session() session: ActiveSession,
  ) {
    return this.categoriesService.update(
      categoryId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete(':categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.DOCUMENT_CATEGORIES_DELETE)
  async remove(
    @Headers('x-organization-id') organizationId: string,
    @Param('categoryId') categoryId: string,
    @Session() session: ActiveSession,
  ) {
    await this.categoriesService.remove(
      categoryId,
      organizationId,
      session.user.id,
    );
  }
}
