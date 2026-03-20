import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class AddChecklistItemDto {
  @IsInt()
  @Min(1)
  itemNumber: number;

  @IsString()
  documentName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsString()
  observations?: string;
}
