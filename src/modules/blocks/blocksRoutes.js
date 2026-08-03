import express from 'express';
import { listBlocks, createBlock, getBlockById, updateBlock, deleteBlock } from './blocksController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import optionalAuthMiddleware from '../../middleware/optionalAuthMiddleware.js';
import validateMiddleware from '../../middleware/validateMiddleware.js';
import { blockBodySchema } from '../../schemas/entities/block.js';
import { blockListParamsSchema, blockItemParamsSchema } from '../../utils/schemas.js';

const router = express.Router({ mergeParams: true });
const blockRouteParamsSchema = blockListParamsSchema;
const blockItemRouteParamsSchema = blockItemParamsSchema;
const blockCreateBodySchema = blockBodySchema;
const blockUpdateBodySchema = blockBodySchema.partial();

router.get('/', optionalAuthMiddleware, validateMiddleware({ params: blockRouteParamsSchema }), listBlocks);
router.post('/', authMiddleware, validateMiddleware({ params: blockRouteParamsSchema }), validateMiddleware({ body: blockCreateBodySchema }), createBlock);
router.get('/:id', optionalAuthMiddleware, validateMiddleware({ params: blockItemRouteParamsSchema }), getBlockById);
router.put('/:id', authMiddleware, validateMiddleware({ params: blockItemRouteParamsSchema }), validateMiddleware({ body: blockUpdateBodySchema }), updateBlock);
router.delete('/:id', authMiddleware, validateMiddleware({ params: blockItemRouteParamsSchema }), deleteBlock);

export default router;
