import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStatusTransitionRuleDto {
  @IsOptional()
  @IsBoolean()
  requiresAllRequiredDocuments?: boolean;
}
