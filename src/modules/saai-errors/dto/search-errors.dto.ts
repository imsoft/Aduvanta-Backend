import { z } from 'zod';

export const searchErrorsSchema = z.object({
  query: z.string().min(1).max(200),
});

export type SearchErrorsDto = z.infer<typeof searchErrorsSchema>;

export const registroParamSchema = z.object({
  registro: z.coerce.number().int().positive(),
});

export type RegistroParamDto = z.infer<typeof registroParamSchema>;

export const errorKeyParamSchema = z.object({
  registro: z.coerce.number().int().positive(),
  campo: z.coerce.number().int().min(0),
  tipo: z.coerce.number().int().min(0),
  numero: z.coerce.number().int().min(0),
});

export type ErrorKeyParamDto = z.infer<typeof errorKeyParamSchema>;
