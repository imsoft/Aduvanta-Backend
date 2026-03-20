import { IsString, IsOptional, IsEnum } from 'class-validator';

const PARTY_ROLES = [
  'IMPORTER',
  'EXPORTER',
  'SELLER',
  'BUYER',
  'CUSTOMS_BROKER',
  'CARRIER',
  'CONSIGNEE',
  'OTHER',
] as const;
type PartyRole = (typeof PARTY_ROLES)[number];

export class AddEntryPartyDto {
  @IsEnum(PARTY_ROLES)
  role: PartyRole;

  @IsString()
  taxId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  curp?: string;
}
