import { IsString, IsIn } from 'class-validator';

export class ChangePlanDto {
  @IsString()
  planId: string;

  @IsIn(['month', 'year'])
  billingInterval: 'month' | 'year';
}
