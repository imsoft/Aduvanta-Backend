import { z } from 'zod';
import { VALID_CATALOGS } from '../anexo22.repository.js';

export const searchCatalogSchema = z.object({
  query: z.string().min(1).max(100),
});

export type SearchCatalogDto = z.infer<typeof searchCatalogSchema>;

export const catalogParamSchema = z.object({
  catalog: z.enum(VALID_CATALOGS as [string, ...string[]]),
});

export type CatalogParamDto = z.infer<typeof catalogParamSchema>;

export const catalogCodeParamSchema = z.object({
  catalog: z.enum(VALID_CATALOGS as [string, ...string[]]),
  code: z.string().min(1),
});

export type CatalogCodeParamDto = z.infer<typeof catalogCodeParamSchema>;
