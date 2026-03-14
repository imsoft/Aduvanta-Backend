import { IsBoolean, IsIn, IsOptional } from 'class-validator';

const OPERATION_STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as const;

export class CreateStatusTransitionRuleDto {
  @IsIn(OPERATION_STATUSES)
  fromStatus: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

  @IsIn(OPERATION_STATUSES)
  toStatus: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

  @IsOptional()
  @IsBoolean()
  requiresAllRequiredDocuments?: boolean;
}
