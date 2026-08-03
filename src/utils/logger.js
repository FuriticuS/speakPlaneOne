const logError = (err, req) => {
  console.error(JSON.stringify({
    message: err.message,
    status: err.statusCode || 500,
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  }, null, 2));
};

export { logError };
