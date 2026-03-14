import { IsIn, IsOptional } from 'class-validator';

export class ListIntegrationsDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsIn(['WEBHOOK'])
  provider?: 'WEBHOOK';
}
