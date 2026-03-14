import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChangeOperationStatusDto {
  @IsIn(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
  status: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
