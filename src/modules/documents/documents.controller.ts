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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { DocumentsService } from './documents.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { ListOperationDocumentsDto } from './dto/list-operation-documents.dto.js';
import type { Express } from 'express';

@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // --- Operation documents ---

  @Get('operations/:operationId/documents')
  @RequirePermission(PERMISSION.DOCUMENTS_READ)
  async listForOperation(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Query() query: ListOperationDocumentsDto,
  ) {
    return this.documentsService.listForOperation(
      operationId,
      organizationId,
      query,
    );
  }

  @Post('operations/:operationId/documents')
  @RequirePermission(PERMISSION.DOCUMENTS_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: ActiveSession,
  ) {
    return this.documentsService.create(
      operationId,
      organizationId,
      dto,
      file,
      session.user.id,
    );
  }

  // --- Single document ---

  @Get('documents/:documentId')
  @RequirePermission(PERMISSION.DOCUMENTS_READ)
  async getById(
    @Headers('x-organization-id') organizationId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.getById(documentId, organizationId);
  }

  @Patch('documents/:documentId')
  @RequirePermission(PERMISSION.DOCUMENTS_UPDATE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('documentId') documentId: string,
    @Body() dto: UpdateDocumentDto,
    @Session() session: ActiveSession,
  ) {
    return this.documentsService.update(
      documentId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete('documents/:documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.DOCUMENTS_DELETE)
  async deactivate(
    @Headers('x-organization-id') organizationId: string,
    @Param('documentId') documentId: string,
    @Session() session: ActiveSession,
  ) {
    await this.documentsService.deactivate(
      documentId,
      organizationId,
      session.user.id,
    );
  }

  // --- Versions ---

  @Get('documents/:documentId/versions')
  @RequirePermission(PERMISSION.DOCUMENTS_READ)
  async getVersions(
    @Headers('x-organization-id') organizationId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.getVersions(documentId, organizationId);
  }

  @Post('documents/:documentId/versions')
  @RequirePermission(PERMISSION.DOCUMENTS_UPLOAD_VERSION)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVersion(
    @Headers('x-organization-id') organizationId: string,
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: ActiveSession,
  ) {
    return this.documentsService.uploadVersion(
      documentId,
      organizationId,
      file,
      session.user.id,
    );
  }

  // --- Download ---

  @Get('documents/:documentId/download-url')
  @RequirePermission(PERMISSION.DOCUMENTS_DOWNLOAD)
  async getDownloadUrl(
    @Headers('x-organization-id') organizationId: string,
    @Param('documentId') documentId: string,
    @Session() session: ActiveSession,
  ) {
    return this.documentsService.getDownloadUrl(
      documentId,
      organizationId,
      session.user.id,
    );
  }
}
