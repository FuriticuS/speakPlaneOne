import express from 'express';
import { z } from 'zod';
import { listPages, createPage, getPageById, updatePage, deletePage } from './pagesController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import optionalAuthMiddleware from '../../middleware/optionalAuthMiddleware.js';
import validateMiddleware from '../../middleware/validateMiddleware.js';

const router = express.Router({ mergeParams: true });
const pageParamsSchema = z.object({
  projectId: z.string().regex(/^\d+$/, 'Project id must be a number'),
  id: z.string().regex(/^\d+$/, 'Page id must be a number').optional(),
});
const pageCreateBodySchema = z.object({
  title: z.string().trim().min(1, 'Page title is required').max(120, 'Page title must be at most 120 characters'),
  slug: z.string().trim().min(1, 'Page slug is required').max(120, 'Page slug must be at most 120 characters'),
});
const pageUpdateBodySchema = pageCreateBodySchema.partial();

router.get('/', optionalAuthMiddleware, validateMiddleware({ params: pageParamsSchema }), listPages);
router.post('/', authMiddleware, validateMiddleware({ params: pageParamsSchema }), validateMiddleware({ body: pageCreateBodySchema }), createPage);
router.get('/:id', optionalAuthMiddleware, validateMiddleware({ params: pageParamsSchema }), getPageById);
router.put('/:id', authMiddleware, validateMiddleware({ params: pageParamsSchema }), validateMiddleware({ body: pageUpdateBodySchema }), updatePage);
router.delete('/:id', authMiddleware, validateMiddleware({ params: pageParamsSchema }), deletePage);

export default router;
