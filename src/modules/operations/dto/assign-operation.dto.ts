import { IsOptional, IsUUID } from 'class-validator';

export class AssignOperationDto {
  @IsOptional()
  @IsUUID()
  assignedUserId: string | null;
}
