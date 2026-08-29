import express from 'express';
import { listBlocks, getBlockById, createBlock, updateBlock, deleteBlock } from './blocksController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import optionalAuthMiddleware from '../../middleware/optionalAuthMiddleware.js';
import validateMiddleware from '../../middleware/validateMiddleware.js';
import {
  blockCreateSchema,
  blockUpdateSchema,
  blockParamsSchema,
  blockBboxQuerySchema,
} from '../../schemas/entities/block.js';

const router = express.Router();

router.get('/', optionalAuthMiddleware, validateMiddleware({ query: blockBboxQuerySchema }), listBlocks);
router.post('/', authMiddleware, validateMiddleware({ body: blockCreateSchema }), createBlock);
router.get('/:id', optionalAuthMiddleware, validateMiddleware({ params: blockParamsSchema }), getBlockById);
router.put('/:id', authMiddleware, validateMiddleware({ params: blockParamsSchema }), validateMiddleware({ body: blockUpdateSchema }), updateBlock);
router.delete('/:id', authMiddleware, validateMiddleware({ params: blockParamsSchema }), deleteBlock);

export default router;
