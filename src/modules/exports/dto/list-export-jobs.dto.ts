import { IsIn, IsOptional } from 'class-validator';

export class ListExportJobsDto {
  @IsOptional()
  @IsIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  @IsOptional()
  @IsIn(['CLIENTS', 'OPERATIONS', 'FINANCE'])
  type?: 'CLIENTS' | 'OPERATIONS' | 'FINANCE';
}
