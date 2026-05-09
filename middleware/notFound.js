const notFound = (req, res, next) => {
  res.status(404).json({ 
    error: `Route ${req.method} ${req.url} not found`,
    message: 'Please check the API documentation for valid endpoints'
  });
};

module.exports = notFound;