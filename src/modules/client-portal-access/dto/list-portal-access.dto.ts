import { IsOptional, IsUUID } from 'class-validator';

export class ListPortalAccessDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  userId?: string;
}
