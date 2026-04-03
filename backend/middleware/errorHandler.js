function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled error:', err);
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && err.details ? { details: err.details } : {})
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
