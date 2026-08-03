import { AppError } from '../../utils/appError.js';
import {
  listBlocks as listBlocksService,
  createBlock as createBlockService,
  getBlockById as getBlockByIdService,
  updateBlock as updateBlockService,
  deleteBlock as deleteBlockService,
} from './blocksService.js';

const listBlocks = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pageId = Number(req.validatedParams?.pageId ?? req.params.pageId);
    const blocks = await listBlocksService({ user: req.user, projectId, pageId, query: req.query });
    res.json({ success: true, data: blocks });
  } catch (error) {
    next(error);
  }
};

const createBlock = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pageId = Number(req.validatedParams?.pageId ?? req.params.pageId);
    const block = await createBlockService({ user: req.user, projectId, pageId, body: req.validatedBody || req.body });

    if (!block) {
      throw new AppError('Unable to create block', 400);
    }

    res.status(201).json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

const getBlockById = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pageId = Number(req.validatedParams?.pageId ?? req.params.pageId);
    const blockId = Number(req.validatedParams?.id ?? req.params.id);
    const block = await getBlockByIdService({ user: req.user, projectId, pageId, id: blockId });

    if (!block) {
      throw new AppError('Block not found', 404);
    }

    res.json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

const updateBlock = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pageId = Number(req.validatedParams?.pageId ?? req.params.pageId);
    const blockId = Number(req.validatedParams?.id ?? req.params.id);
    const block = await updateBlockService({ user: req.user, projectId, pageId, id: blockId, body: req.validatedBody || req.body });

    if (!block) {
      throw new AppError('Block not found', 404);
    }

    res.json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

const deleteBlock = async (req, res, next) => {
  try {
    const projectId = Number(req.validatedParams?.projectId ?? req.params.projectId);
    const pageId = Number(req.validatedParams?.pageId ?? req.params.pageId);
    const blockId = Number(req.validatedParams?.id ?? req.params.id);
    const deleted = await deleteBlockService({ user: req.user, projectId, pageId, id: blockId });

    if (!deleted) {
      throw new AppError('Block not found', 404);
    }

    res.json({ success: true, message: 'Block deleted' });
  } catch (error) {
    next(error);
  }
};

export { listBlocks, createBlock, getBlockById, updateBlock, deleteBlock };
