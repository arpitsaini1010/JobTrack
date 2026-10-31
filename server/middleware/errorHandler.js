const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  // CastError (e.g. invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Application not found' });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong, try again'
  });
};

module.exports = errorHandler;
