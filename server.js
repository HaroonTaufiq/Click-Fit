/**
 * Click Fit - Main Server Entry Point
 * Express server with file upload and MySQL integration
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Configuration
const config = require('./config/config');
const { initializeDatabase } = require('./config/database');

// Routes
const apiRoutes = require('./routes');

// Middleware
const {
    multerErrorHandler,
    fileValidationErrorHandler,
    notFoundHandler,
    generalErrorHandler
} = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow cross-origin requests
app.use(cors(config.CORS));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// STATIC FILES
// ============================================

// Serve static files from project root (for index.html, css, js)
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded images
app.use('/uploads', express.static(config.UPLOAD.UPLOAD_DIR));

// ============================================
// API ROUTES
// ============================================

app.use('/api', apiRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// Multer error handler
app.use(multerErrorHandler);

// File validation error handler
app.use(fileValidationErrorHandler);

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Catch-all: serve index.html for any other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// General error handler
app.use(generalErrorHandler);

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
    try {
        // Initialize database (creates tables and stored procedures)
        console.log('\n🚀 Starting Click Fit Server...\n');
        console.log('📦 Initializing database...');
        await initializeDatabase();
        
        // Start server
        app.listen(config.PORT, () => {
            console.log('\n============================================');
            console.log(`✅ Server running on http://localhost:${config.PORT}`);
            console.log('============================================');
            console.log('\nEndpoints:');
            console.log(`  📄 Frontend:     http://localhost:${config.PORT}`);
            console.log(`  📤 Upload API:   http://localhost:${config.PORT}/api/upload`);
            console.log(`  📋 List Files:   http://localhost:${config.PORT}/api/upload/list`);
            console.log(`  💚 Health Check: http://localhost:${config.PORT}/api/health`);
            console.log('\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\nShutting down gracefully...');
    const { closePool } = require('./config/database');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\nShutting down gracefully...');
    const { closePool } = require('./config/database');
    await closePool();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
