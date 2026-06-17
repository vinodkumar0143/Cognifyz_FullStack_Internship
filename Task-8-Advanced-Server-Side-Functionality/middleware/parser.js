module.exports = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (req.body !== undefined || !contentType.includes('application/json')) {
    req.body = req.body || {};
    return next();
  }

  let bodyData = '';
  req.on('data', (chunk) => {
    bodyData += chunk;
  });

  req.on('end', () => {
    if (!bodyData) {
      req.body = {};
      return next();
    }
    try {
      req.body = JSON.parse(bodyData);
      next();
    } catch (err) {
      res.status(400).json({
        success: false,
        error: 'Invalid JSON body format'
      });
    }
  });

  req.on('error', (err) => {
    next(err);
  });
};
