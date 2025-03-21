// Custom error class for API errors
export class APIError extends Error {
    constructor(message, statusCode, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Handle Flow blockchain errors
export const handleFlowError = (error) => {
    if (error.message.includes('insufficient funds')) {
        return new APIError('Insufficient Flow tokens for transaction', 400, 'INSUFFICIENT_FUNDS');
    }
    if (error.message.includes('not found')) {
        return new APIError('Resource not found on blockchain', 404, 'BLOCKCHAIN_RESOURCE_NOT_FOUND');
    }
    if (error.message.includes('unauthorized')) {
        return new APIError('Unauthorized blockchain operation', 403, 'BLOCKCHAIN_UNAUTHORIZED');
    }
    return new APIError('Blockchain operation failed', 500, 'BLOCKCHAIN_ERROR');
};

// Handle MongoDB errors
export const handleMongoError = (error) => {
    if (error.code === 11000) {
        return new APIError('Duplicate key error', 409, 'DUPLICATE_KEY');
    }
    if (error.name === 'ValidationError') {
        return new APIError('Validation error', 400, 'VALIDATION_ERROR');
    }
    if (error.name === 'CastError') {
        return new APIError('Invalid ID format', 400, 'INVALID_ID');
    }
    return new APIError('Database operation failed', 500, 'DATABASE_ERROR');
};

// Handle JWT errors
export const handleJWTError = (error) => {
    if (error.name === 'JsonWebTokenError') {
        return new APIError('Invalid token', 401, 'INVALID_TOKEN');
    }
    if (error.name === 'TokenExpiredError') {
        return new APIError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    return new APIError('Authentication failed', 401, 'AUTH_ERROR');
};

// Main error handling middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Handle specific error types
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'APIError') {
        return res.status(error.statusCode).json({
            status: error.status,
            code: error.code,
            message: error.message
        });
    }

    if (error.message.includes('Flow')) {
        error = handleFlowError(error);
    } else if (error.name === 'MongoError') {
        error = handleMongoError(error);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        error = handleJWTError(error);
    }

    // Send error response
    res.status(error.statusCode).json({
        status: error.status,
        code: error.code,
        message: error.message
    });
};

// Handle 404 errors
export const notFoundHandler = (req, res, next) => {
    next(new APIError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
};

// Handle async errors
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}; 