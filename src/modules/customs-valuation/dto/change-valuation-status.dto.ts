import { IsString, IsOptional } from 'class-validator';

export class ChangeValuationStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
