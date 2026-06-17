module.exports = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;

    let statusIndicator = 'ℹ️';
    if (status >= 500) statusIndicator = '🚨';
    else if (status >= 400) statusIndicator = '⚠️';
    else if (status >= 300) statusIndicator = '🔄';
    else if (status >= 200) statusIndicator = '✅';

    console.log(`[${timestamp}] ${statusIndicator} ${method} ${url} - Status: ${status} (${elapsed}ms)`);
  });

  next();
};
