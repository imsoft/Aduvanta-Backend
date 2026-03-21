import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator.js';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard.js';
import { AbuseDetectionGuard } from '../../common/abuse-detection/abuse-detection.guard.js';
import { UnitConverterService } from './unit-converter.service.js';
import { ConvertDto } from './dto/convert.dto.js';
import { ConvertAllDto } from './dto/convert-all.dto.js';

@RateLimit('search')
@Controller('unit-converter')
@UseGuards(AuthGuard, AbuseDetectionGuard, RateLimitGuard)
export class UnitConverterController {
  constructor(private readonly service: UnitConverterService) {}

  @Get('categories')
  listCategories() {
    return this.service.listCategories();
  }

  @Get('categories/:category/units')
  getUnitsForCategory(@Param('category') category: string) {
    return this.service.getUnitsForCategory(category);
  }

  @Get('convert')
  convert(@Query() dto: ConvertDto) {
    return this.service.convert(
      dto.category,
      dto.fromUnit,
      dto.toUnit,
      dto.value,
    );
  }

  @Get('convert-all')
  convertAll(@Query() dto: ConvertAllDto) {
    return this.service.convertAll(dto.category, dto.fromUnit, dto.value);
  }
}
