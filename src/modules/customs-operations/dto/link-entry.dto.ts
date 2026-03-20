import { IsString, IsOptional } from 'class-validator';

export class LinkEntryDto {
  @IsString()
  entryId: string;

  @IsOptional()
  @IsString()
  relationship?: string;
}
