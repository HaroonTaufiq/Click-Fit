/**
 * Multer Configuration
 * File upload middleware configuration
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Ensure upload directory exists
if (!fs.existsSync(config.UPLOAD.UPLOAD_DIR)) {
    fs.mkdirSync(config.UPLOAD.UPLOAD_DIR, { recursive: true });
}

/**
 * Storage configuration
 * Defines where and how files are stored
 */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, config.UPLOAD.UPLOAD_DIR);
    },
    filename: function(req, file, cb) {
        // Generate unique filename: timestamp-randomstring.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `image-${uniqueSuffix}${ext}`);
    }
});

/**
 * File filter
 * Validates file type before upload
 */
const fileFilter = function(req, file, cb) {
    // Check MIME type
    if (!config.UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        const error = new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.');
        error.code = 'INVALID_FILE_TYPE';
        return cb(error, false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!config.UPLOAD.ALLOWED_EXTENSIONS.includes(ext)) {
        const error = new Error('Invalid file extension.');
        error.code = 'INVALID_EXTENSION';
        return cb(error, false);
    }

    cb(null, true);
};

/**
 * Multer upload instance
 */
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.UPLOAD.MAX_FILE_SIZE,
        files: 10 // Maximum 10 files per request
    }
});

module.exports = upload;
