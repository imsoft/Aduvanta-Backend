import { IsIn, IsOptional } from 'class-validator';

export class ListImportJobsDto {
  @IsOptional()
  @IsIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}
