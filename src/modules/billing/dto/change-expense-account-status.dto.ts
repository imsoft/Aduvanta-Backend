import { IsString, IsOptional } from 'class-validator';

export class ChangeExpenseAccountStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
