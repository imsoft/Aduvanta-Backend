import { IsString, IsIn } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  planId: string;

  @IsIn(['month', 'year'])
  billingInterval: 'month' | 'year';
}
