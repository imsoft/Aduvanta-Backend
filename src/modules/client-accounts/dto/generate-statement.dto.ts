import { IsString, IsDateString } from 'class-validator';

export class GenerateStatementDto {
  @IsString()
  clientId: string;

  @IsDateString()
  periodFrom: string;

  @IsDateString()
  periodTo: string;
}
