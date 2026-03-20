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
import { SaaiErrorsService } from './saai-errors.service.js';
import {
  registroParamSchema,
  errorKeyParamSchema,
  searchErrorsSchema,
} from './dto/search-errors.dto.js';

@ApiTags('SAAI Errors')
@Controller('saai-errors')
@UseGuards(AuthGuard)
export class SaaiErrorsController {
  constructor(private readonly service: SaaiErrorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all SAAI error codes' })
  async findAll() {
    return this.service.findAll();
  }

  @Get('registro-types')
  @ApiOperation({ summary: 'List all SAAI M3 registro types' })
  async findAllRegistroTypes() {
    return this.service.findAllRegistroTypes();
  }

  @Get('count')
  @ApiOperation({ summary: 'Count active SAAI error codes' })
  async count() {
    const count = await this.service.count();
    return { count };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search SAAI errors by description' })
  async search(@Query('q') q: string) {
    const parsed = searchErrorsSchema.safeParse({ query: q });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.service.search(parsed.data.query);
  }

  @Get('registro/:registro')
  @ApiOperation({ summary: 'Get all errors for a specific registro' })
  async findByRegistro(@Param('registro') registro: string) {
    const parsed = registroParamSchema.safeParse({ registro });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.service.findByRegistro(parsed.data.registro);
  }

  @Get(':registro/:campo/:tipo/:numero')
  @ApiOperation({ summary: 'Get a specific SAAI error by its composite key' })
  async findByKey(
    @Param('registro') registro: string,
    @Param('campo') campo: string,
    @Param('tipo') tipo: string,
    @Param('numero') numero: string,
  ) {
    const parsed = errorKeyParamSchema.safeParse({
      registro,
      campo,
      tipo,
      numero,
    });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.service.findByKey(
      parsed.data.registro,
      parsed.data.campo,
      parsed.data.tipo,
      parsed.data.numero,
    );
  }
}
