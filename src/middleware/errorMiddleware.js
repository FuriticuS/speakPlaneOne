import { logError } from '../utils/logger.js';

const errorMiddleware = (err, req, res, next) => {
  logError(err, req);

  const status = err.statusCode || 500;
  const aggregateMessage =
    err instanceof AggregateError && Array.isArray(err.errors)
      ? err.errors.map((inner) => inner?.message).filter(Boolean).join('; ')
      : null;
  const message = err.message || aggregateMessage || err.code || 'Internal server error';

  res.status(status).json({
    success: false,
    error: {
      message,
      status,
      path: req.originalUrl,
      method: req.method,
    },
  });
};

export default errorMiddleware;
