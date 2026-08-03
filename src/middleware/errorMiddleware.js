const errorMiddleware = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

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
