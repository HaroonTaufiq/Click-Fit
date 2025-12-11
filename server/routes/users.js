/**
 * Users Routes
 * Handles all user-related endpoints
 */

const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');

/**
 * GET /api/users
 * Get all users (excluding passwords)
 */
router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT userId, email, type, active, createdAt FROM users ORDER BY createdAt DESC'
        );

        res.json({
            success: true,
            count: rows.length,
            users: rows
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

/**
 * GET /api/users/:id
 * Get single user by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT userId, email, type, active, createdAt FROM users WHERE userId = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: rows[0]
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
});

/**
 * POST /api/users
 * Create new user using stored procedure
 */
router.post('/', async (req, res) => {
    try {
        const { email, password, type } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const pool = getPool();
        
        // Call stored procedure to add user
        const userType = type === 'admin' ? 'admin' : 'user';
        const [result] = await pool.query(
            'CALL addUser(?, ?, ?)',
            [email, password, userType]
        );

        // Get the new user ID from the stored procedure result
        const userId = result[0][0].userId;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: userId
        });
    } catch (error) {
        console.error('Create user error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
});

/**
 * PUT /api/users/:id/toggle
 * Toggle user active status
 */
router.put('/:id/toggle', async (req, res) => {
    try {
        const pool = getPool();
        
        // Toggle active status
        const [result] = await pool.query(
            'UPDATE users SET active = NOT active WHERE userId = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User status updated'
        });
    } catch (error) {
        console.error('Toggle user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});

/**
 * DELETE /api/users/:id
 * Delete user
 */
router.delete('/:id', async (req, res) => {
    try {
        const pool = getPool();
        
        const [result] = await pool.query(
            'DELETE FROM users WHERE userId = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

module.exports = router;
