import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListRuleSetsDto {
  @IsOptional()
  @IsIn(['IMPORT', 'EXPORT', 'INTERNAL'])
  operationType?: 'IMPORT' | 'EXPORT' | 'INTERNAL';

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
