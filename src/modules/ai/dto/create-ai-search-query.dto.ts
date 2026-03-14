import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const AI_SEARCH_QUERY_TYPES = [
  'PENDING_OPERATIONS',
  'URGENT_WITHOUT_ASSIGNEE',
  'OVERDUE_OPERATIONS',
] as const;

export type AiSearchQueryType = (typeof AI_SEARCH_QUERY_TYPES)[number];

export class CreateAiSearchQueryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  queryText: string;

  @IsIn(AI_SEARCH_QUERY_TYPES)
  queryType: AiSearchQueryType;
}
