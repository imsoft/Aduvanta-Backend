import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOperationDto {
  @IsUUID()
  clientId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  reference: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsIn(['IMPORT', 'EXPORT', 'INTERNAL'])
  type: 'IMPORT' | 'EXPORT' | 'INTERNAL';

  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
