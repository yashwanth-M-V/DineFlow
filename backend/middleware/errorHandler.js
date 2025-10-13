const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(400).json({
      error: 'Duplicate entry',
      message: 'This record already exists'
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Reference error',
      message: 'The referenced record does not exist'
    });
  }

  res.status(500).json({
    error: 'Server error',
    message: 'Something went wrong on the server'
  });
};

module.exports = errorHandler;