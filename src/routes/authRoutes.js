import express from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateMiddleware from '../middleware/validateMiddleware.js';
import { authSchema } from '../schemas/auth.js';

const router = express.Router();

router.post('/register', validateMiddleware({ body: authSchema }), register);
router.post('/login', validateMiddleware({ body: authSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

export default router;
