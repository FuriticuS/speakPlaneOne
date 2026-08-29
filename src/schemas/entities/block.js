import { z } from 'zod';

// Тело создания блока: точка клика по пустому месту (мировые координаты).
const blockCreateSchema = z.object({
  x: z.coerce.number().finite(),
  y: z.coerce.number().finite(),
});

// Тело записи текста в блок (один раз).
const blockUpdateSchema = z.object({
  content: z.string().min(1, 'Content must not be empty'),
});

const blockParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Block id must be a number'),
});

const blockBboxQuerySchema = z.object({
  bbox: z
    .string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'bbox must be "x1,y1,x2,y2"')
    .optional(),
});

export { blockCreateSchema, blockUpdateSchema, blockParamsSchema, blockBboxQuerySchema };
