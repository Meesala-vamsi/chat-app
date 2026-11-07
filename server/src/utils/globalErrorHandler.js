const errorHandler = (err, req, res, next) => {
    // 1. Log the error for the developer (useful for debugging)
    console.error(err.stack);

    // 2. Set default status and message if they aren't already set
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // 3. Handle specific Mongoose/MongoDB errors cleanly
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered. User already exists.';
    }

    if (err.name === 'CastError') {
        statusCode = 404;
        message = `Resource not found with id of ${err.value}`;
    }

    // 4. Send the clean JSON response to the client
    res.status(statusCode).json({
        status: false,
        message: message
    });
};

module.exports = errorHandler;
