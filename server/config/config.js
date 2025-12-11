/**
 * Server Configuration
 * Central configuration for all server settings
 */

const path = require('path');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    // Server Settings
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Database Configuration
    DB: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'clickfit',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        // For cloud MySQL (e.g., PlanetScale, Railway)
        ssl: isProduction ? { rejectUnauthorized: true } : false
    },

    // Upload Configuration
    UPLOAD: {
        // Directory for uploaded images (relative to project root)
        UPLOAD_DIR: path.join(__dirname, '..', '..', 'upload_images'),
        
        // Maximum file size in bytes (5MB)
        MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
        
        // Allowed MIME types
        ALLOWED_MIME_TYPES: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ],
        
        // Allowed file extensions
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },

    // CORS Configuration
    CORS: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
};
