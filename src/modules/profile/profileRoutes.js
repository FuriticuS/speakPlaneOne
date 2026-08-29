import express from 'express';
import { getProfile, updateProfile } from './profileController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import validateMiddleware from '../../middleware/validateMiddleware.js';
import { profileSchema } from '../../schemas/entities/profile.js';

const router = express.Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, validateMiddleware({ body: profileSchema }), updateProfile);

export default router;
