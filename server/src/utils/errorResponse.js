class ErrorResponse extends Error {
    constructor(message, statusCode) {
        // Pass the message to the parent Error class
        super(message);
        
        // Attach the custom HTTP status code
        this.statusCode = statusCode;

        // Captures the stack trace, keeping the constructor out of it
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorResponse;
