import { IsIn, IsOptional } from 'class-validator';

export class ListOperationAdvancesDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
