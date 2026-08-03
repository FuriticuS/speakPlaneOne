import express from 'express';
import { z } from 'zod';
import { listBlocks, createBlock, getBlockById, updateBlock, deleteBlock } from './blocksController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import optionalAuthMiddleware from '../../middleware/optionalAuthMiddleware.js';
import validateMiddleware from '../../middleware/validateMiddleware.js';

const router = express.Router({ mergeParams: true });
const blockParamsSchema = z.object({
  projectId: z.string().regex(/^\d+$/, 'Project id must be a number'),
  pageId: z.string().regex(/^\d+$/, 'Page id must be a number'),
  id: z.string().regex(/^\d+$/, 'Block id must be a number').optional(),
});
const blockCreateBodySchema = z.object({
  type: z.enum(['text', 'image', 'button'], { errorMap: () => ({ message: 'Block type must be text, image or button' }) }),
  payload: z.record(z.any()).optional(),
});
const blockUpdateBodySchema = blockCreateBodySchema.partial();

router.get('/', optionalAuthMiddleware, validateMiddleware({ params: blockParamsSchema }), listBlocks);
router.post('/', authMiddleware, validateMiddleware({ params: blockParamsSchema }), validateMiddleware({ body: blockCreateBodySchema }), createBlock);
router.get('/:id', optionalAuthMiddleware, validateMiddleware({ params: blockParamsSchema }), getBlockById);
router.put('/:id', authMiddleware, validateMiddleware({ params: blockParamsSchema }), validateMiddleware({ body: blockUpdateBodySchema }), updateBlock);
router.delete('/:id', authMiddleware, validateMiddleware({ params: blockParamsSchema }), deleteBlock);

export default router;
