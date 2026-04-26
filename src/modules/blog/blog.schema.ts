import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsUrl,
  Min,
  Max,
  MinLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

const POST_STATUSES = ['DRAFT', 'PUBLISHED'] as const;
type PostStatus = (typeof POST_STATUSES)[number];

export class CreateBlogPostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsString()
  @MinLength(1)
  excerpt: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsEnum(POST_STATUSES)
  status: PostStatus;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsEnum(POST_STATUSES)
  status?: PostStatus;
}

export class ListBlogPostsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(POST_STATUSES)
  status?: PostStatus;
}
