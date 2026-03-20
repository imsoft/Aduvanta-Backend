import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { Anexo22Service } from './anexo22.service.js';
import {
  catalogParamSchema,
  catalogCodeParamSchema,
  searchCatalogSchema,
} from './dto/search-catalog.dto.js';
import type { CatalogName } from './anexo22.repository.js';

@ApiTags('Anexo 22')
@Controller('anexo22')
@UseGuards(AuthGuard)
export class Anexo22Controller {
  constructor(private readonly service: Anexo22Service) {}

  @Get('catalogs')
  @ApiOperation({ summary: 'List all available Anexo 22 catalogs' })
  listCatalogs() {
    return this.service.listCatalogs();
  }

  @Get(':catalog')
  @ApiOperation({ summary: 'Get all entries from a catalog' })
  async findAll(@Param('catalog') catalog: string) {
    const parsed = catalogParamSchema.safeParse({ catalog });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.service.findAll(parsed.data.catalog as CatalogName);
  }

  @Get(':catalog/count')
  @ApiOperation({ summary: 'Count active entries in a catalog' })
  async count(@Param('catalog') catalog: string) {
    const parsed = catalogParamSchema.safeParse({ catalog });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    const count = await this.service.count(parsed.data.catalog as CatalogName);
    return { catalog: parsed.data.catalog, count };
  }

  @Get(':catalog/search')
  @ApiOperation({
    summary: 'Search entries in a catalog by code or description',
  })
  async search(@Param('catalog') catalog: string, @Query('q') q: string) {
    const catalogParsed = catalogParamSchema.safeParse({ catalog });
    if (!catalogParsed.success) {
      throw new BadRequestException(catalogParsed.error.issues);
    }
    const queryParsed = searchCatalogSchema.safeParse({ query: q });
    if (!queryParsed.success) {
      throw new BadRequestException(queryParsed.error.issues);
    }
    return this.service.search(
      catalogParsed.data.catalog as CatalogName,
      queryParsed.data.query,
    );
  }

  @Get(':catalog/:code')
  @ApiOperation({ summary: 'Get a single catalog entry by code' })
  async findByCode(
    @Param('catalog') catalog: string,
    @Param('code') code: string,
  ) {
    const parsed = catalogCodeParamSchema.safeParse({ catalog, code });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.service.findByCode(
      parsed.data.catalog as CatalogName,
      parsed.data.code,
    );
  }
}
