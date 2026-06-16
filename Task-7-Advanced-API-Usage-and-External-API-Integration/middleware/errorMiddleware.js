const errorHandler = (err, req, res, next) => {
    console.error('Unhandled API Error Stack:', err.stack || err);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'An unexpected server error occurred.';

    // Catch specific Mongoose errors
    // 1. CastError (e.g., invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found. Invalid ID parameter: ${err.value}`;
    }

    // 2. Duplicate Key Error (e.g., duplicate username or email)
    if (err.code === 11000) {
        statusCode = 400;
        const duplicateKey = Object.keys(err.keyValue)[0];
        message = `The ${duplicateKey} is already registered. Please use a different value.`;
    }

    // 3. ValidationError (e.g., missing required fields)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
};

module.exports = errorHandler;
