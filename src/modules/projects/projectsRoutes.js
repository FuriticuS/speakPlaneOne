import express from 'express';
import { listProjects, createProject, getProjectById, updateProject, deleteProject } from './projectsController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import optionalAuthMiddleware from '../../middleware/optionalAuthMiddleware.js';
import validateMiddleware from '../../middleware/validateMiddleware.js';
import { projectBodySchema, projectParamsSchema } from '../../schemas/entities/project.js';

const router = express.Router();

router.get('/', optionalAuthMiddleware, listProjects);
router.post('/', authMiddleware, validateMiddleware({ body: projectBodySchema }), createProject);
router.get('/:id', optionalAuthMiddleware, validateMiddleware({ params: projectParamsSchema }), getProjectById);
router.put('/:id', authMiddleware, validateMiddleware({ params: projectParamsSchema }), validateMiddleware({ body: projectBodySchema.partial() }), updateProject);
router.delete('/:id', authMiddleware, validateMiddleware({ params: projectParamsSchema }), deleteProject);

export default router;
