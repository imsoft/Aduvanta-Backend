import { IsString, IsOptional } from 'class-validator';

export class UpdateChecklistItemDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
