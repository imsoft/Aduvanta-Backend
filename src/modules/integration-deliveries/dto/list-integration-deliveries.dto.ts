import { IsIn, IsOptional } from 'class-validator';

export class ListIntegrationDeliveriesDto {
  @IsOptional()
  @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
}
