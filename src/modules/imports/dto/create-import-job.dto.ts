import { IsIn } from 'class-validator';

export class CreateImportJobDto {
  @IsIn(['CLIENTS'])
  type: 'CLIENTS';
}
