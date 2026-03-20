import { IsString, IsOptional } from 'class-validator';

export class ChangeEDocumentStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
