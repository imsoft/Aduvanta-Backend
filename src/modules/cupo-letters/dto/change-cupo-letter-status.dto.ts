import { IsString } from 'class-validator';

export class ChangeCupoLetterStatusDto {
  @IsString()
  status: string;
}
