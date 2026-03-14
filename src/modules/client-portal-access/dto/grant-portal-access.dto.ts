import { IsString, IsUUID } from 'class-validator';

export class GrantPortalAccessDto {
  @IsUUID()
  clientId: string;

  @IsString()
  userId: string;
}
