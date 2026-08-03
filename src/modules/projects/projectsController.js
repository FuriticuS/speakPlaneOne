import { AppError } from '../../utils/appError.js';
import {
  listProjects as listProjectsService,
  createProject as createProjectService,
  getProjectById as getProjectByIdService,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
} from './projectsService.js';

const listProjects = async (req, res, next) => {
  try {
    const projects = await listProjectsService({ user: req.user, query: req.query });
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await createProjectService({ user: req.user, body: req.validatedBody || req.body });

    if (!project) {
      throw new AppError('Unable to create project', 400);
    }

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.id ?? req.params.id);
    const project = await getProjectByIdService({ user: req.user, id: projectId });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.id ?? req.params.id);
    const project = await updateProjectService({ user: req.user, id: projectId, body: req.validatedBody || req.body });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.id ?? req.params.id);
    const deleted = await deleteProjectService({ user: req.user, id: projectId });

    if (!deleted) {
      throw new AppError('Project not found', 404);
    }

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

export { listProjects, createProject, getProjectById, updateProject, deleteProject };
