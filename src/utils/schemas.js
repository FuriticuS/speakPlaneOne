import { z } from 'zod';
import { authSchema } from '../schemas/auth.js';
import { userIdParamSchema, paginationQuerySchema } from '../schemas/common.js';
import { idParamSchema } from '../schemas/entities/common.js';
import { projectBodySchema, projectParamsSchema } from '../schemas/entities/project.js';
import { pageBodySchema, pageParamsSchema } from '../schemas/entities/page.js';
import { blockBodySchema, blockParamsSchema } from '../schemas/entities/block.js';

const pageListParamsSchema = z.object({
  projectId: z.string().regex(/^\d+$/, 'Project id must be a number'),
});

const pageItemParamsSchema = pageListParamsSchema.extend({
  id: z.string().regex(/^\d+$/, 'Page id must be a number'),
});

const blockListParamsSchema = z.object({
  projectId: z.string().regex(/^\d+$/, 'Project id must be a number'),
  pageId: z.string().regex(/^\d+$/, 'Page id must be a number'),
});

const blockItemParamsSchema = blockListParamsSchema.extend({
  id: z.string().regex(/^\d+$/, 'Block id must be a number'),
});

export { authSchema, userIdParamSchema, paginationQuerySchema, idParamSchema, projectBodySchema, projectParamsSchema, pageBodySchema, pageParamsSchema, blockBodySchema, blockParamsSchema, pageListParamsSchema, pageItemParamsSchema, blockListParamsSchema, blockItemParamsSchema };
