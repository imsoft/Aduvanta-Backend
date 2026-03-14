import { IsIn } from 'class-validator';

export class CreateExportJobDto {
  @IsIn(['CLIENTS', 'OPERATIONS', 'FINANCE'])
  type: 'CLIENTS' | 'OPERATIONS' | 'FINANCE';
}
