import { IsString, IsOptional, IsEnum } from 'class-validator';

const ENTRY_STATUSES = [
  'DRAFT',
  'PREVALIDATED',
  'VALIDATED',
  'PAID',
  'DISPATCHED',
  'RELEASED',
  'CANCELLED',
  'RECTIFIED',
] as const;
type EntryStatus = (typeof ENTRY_STATUSES)[number];

export class ChangeEntryStatusDto {
  @IsEnum(ENTRY_STATUSES)
  status: EntryStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
