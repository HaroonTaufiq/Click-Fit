/**
 * API Routes Index
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const uploadRoutes = require('./upload');
const usersRoutes = require('./users');

// Mount routes
router.use('/upload', uploadRoutes);
router.use('/users', usersRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Click Fit API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
