import { IsIn, IsOptional } from 'class-validator';

export class ListOperationChargesDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
