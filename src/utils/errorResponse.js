const errorResponse = (res, status, message) => {
  return res.status(status).json({
    success: false,
    error: {
      message,
      status,
    },
  });
};

export { errorResponse };
