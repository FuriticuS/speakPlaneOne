import { AppError } from '../../utils/appError.js';
import {
  listBlocks as listBlocksService,
  getBlockById as getBlockByIdService,
  createBlock as createBlockService,
  updateBlock as updateBlockService,
  deleteBlock as deleteBlockService,
} from './blocksService.js';

const listBlocks = async (req, res, next) => {
  try {
    const blocks = await listBlocksService({ bbox: req.validatedQuery?.bbox });
    res.json({ success: true, data: blocks });
  } catch (error) {
    next(error);
  }
};

const getBlockById = async (req, res, next) => {
  try {
    const id = Number(req.validatedParams?.id ?? req.params.id);
    const block = await getBlockByIdService(id);
    if (!block) throw new AppError('Block not found', 404);
    res.json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

const createBlock = async (req, res, next) => {
  try {
    const { x, y } = req.validatedBody || req.body;
    const block = await createBlockService({ user: req.user, x, y });
    res.status(201).json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

const updateBlock = async (req, res, next) => {
  try {
    const id = Number(req.validatedParams?.id ?? req.params.id);
    const { content } = req.validatedBody || req.body;
    const block = await updateBlockService({ user: req.user, id, content });
    res.json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

const deleteBlock = async (req, res, next) => {
  try {
    const id = Number(req.validatedParams?.id ?? req.params.id);
    await deleteBlockService({ user: req.user, id });
    res.json({ success: true, message: 'Block deleted' });
  } catch (error) {
    next(error);
  }
};

export { listBlocks, getBlockById, createBlock, updateBlock, deleteBlock };
