import express from 'express';
import { listPages, createPage, getPageById, updatePage, deletePage } from './pagesController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import optionalAuthMiddleware from '../../middleware/optionalAuthMiddleware.js';
import validateMiddleware from '../../middleware/validateMiddleware.js';
import { pageBodySchema } from '../../schemas/entities/page.js';
import { pageListParamsSchema, pageItemParamsSchema } from '../../utils/schemas.js';

const router = express.Router({ mergeParams: true });
const pageRouteParamsSchema = pageListParamsSchema;
const pageItemRouteParamsSchema = pageItemParamsSchema;
const pageCreateBodySchema = pageBodySchema;
const pageUpdateBodySchema = pageBodySchema.partial();

router.get('/', optionalAuthMiddleware, validateMiddleware({ params: pageRouteParamsSchema }), listPages);
router.post('/', authMiddleware, validateMiddleware({ params: pageRouteParamsSchema }), validateMiddleware({ body: pageCreateBodySchema }), createPage);
router.get('/:id', optionalAuthMiddleware, validateMiddleware({ params: pageItemRouteParamsSchema }), getPageById);
router.put('/:id', authMiddleware, validateMiddleware({ params: pageItemRouteParamsSchema }), validateMiddleware({ body: pageUpdateBodySchema }), updatePage);
router.delete('/:id', authMiddleware, validateMiddleware({ params: pageItemRouteParamsSchema }), deletePage);

export default router;
