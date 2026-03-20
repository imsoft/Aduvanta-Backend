import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOperationCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body: string;

  @IsOptional()
  @IsBoolean()
  isClientVisible?: boolean;
}
