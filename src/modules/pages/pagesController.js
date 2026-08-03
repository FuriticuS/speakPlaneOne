import { AppError } from '../../utils/appError.js';
import {
  listPages as listPagesService,
  createPage as createPageService,
  getPageById as getPageByIdService,
  updatePage as updatePageService,
  deletePage as deletePageService,
} from './pagesService.js';

const listPages = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pages = await listPagesService({ user: req.user, projectId, query: req.query });
    res.json({ success: true, data: pages });
  } catch (error) {
    next(error);
  }
};

const createPage = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const page = await createPageService({ user: req.user, projectId, body: req.validatedBody || req.body });

    if (!page) {
      throw new AppError('Unable to create page', 400);
    }

    res.status(201).json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

const getPageById = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pageId = Number(req.validatedParams?.id ?? req.params.id);
    const page = await getPageByIdService({ user: req.user, projectId, id: pageId });

    if (!page) {
      throw new AppError('Page not found', 404);
    }

    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

const updatePage = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pageId = Number(req.validatedParams?.id ?? req.params.id);
    const page = await updatePageService({ user: req.user, projectId, id: pageId, body: req.validatedBody || req.body });

    if (!page) {
      throw new AppError('Page not found', 404);
    }

    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

const deletePage = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pageId = Number(req.validatedParams?.id ?? req.params.id);
    const deleted = await deletePageService({ user: req.user, projectId, id: pageId });

    if (!deleted) {
      throw new AppError('Page not found', 404);
    }

    res.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    next(error);
  }
};

export { listPages, createPage, getPageById, updatePage, deletePage };
