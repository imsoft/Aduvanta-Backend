import { IsString, IsOptional, IsIn } from 'class-validator';

export class AddShipmentCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  visibleToClient?: string;
}
