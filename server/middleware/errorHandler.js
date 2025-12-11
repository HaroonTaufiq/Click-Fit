/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const multer = require('multer');

/**
 * Handle Multer errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        let message = 'File upload error';
        let statusCode = 400;

        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File is too large. Maximum size is 5MB.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files. Maximum is 10 files.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected field name in upload.';
                break;
            default:
                message = err.message;
        }

        return res.status(statusCode).json({
            success: false,
            message: message,
            code: err.code
        });
    }

    next(err);
}

/**
 * Handle custom file validation errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function fileValidationErrorHandler(err, req, res, next) {
    if (err.code === 'INVALID_FILE_TYPE' || err.code === 'INVALID_EXTENSION') {
        return res.status(400).json({
            success: false,
            message: err.message,
            code: err.code
        });
    }

    next(err);
}

/**
 * Handle 404 - Not Found
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: 'Resource not found',
        path: req.originalUrl
    });
}

/**
 * General error handler
 * Catches all unhandled errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function generalErrorHandler(err, req, res, next) {
    console.error('Server Error:', err);

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

module.exports = {
    multerErrorHandler,
    fileValidationErrorHandler,
    notFoundHandler,
    generalErrorHandler
};
