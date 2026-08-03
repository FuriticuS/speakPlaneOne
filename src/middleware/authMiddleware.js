import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError('Access token missing', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired access token', 401));
  }
};

export default authMiddleware;
