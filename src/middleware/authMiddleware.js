import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { errorResponse } from '../utils/errorResponse.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return errorResponse(res, 401, 'Access token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      ...decoded,
      role: decoded.role || 'user',
      isAdmin: decoded.role === 'admin',
    };
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired access token');
  }
};

export default authMiddleware;
