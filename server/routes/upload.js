/**
 * Upload Routes
 * Handles all image upload related endpoints
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../config/multer');
const config = require('../config/config');

/**
 * POST /api/upload
 * Upload single image
 */
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'File uploaded successfully',
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            path: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload file'
        });
    }
});

/**
 * POST /api/upload/multiple
 * Upload multiple images
 */
router.post('/multiple', upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            path: `/uploads/${file.filename}`
        }));

        res.json({
            success: true,
            message: `${req.files.length} file(s) uploaded successfully`,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload files'
        });
    }
});

/**
 * GET /api/upload/list
 * List all uploaded images
 */
router.get('/list', (req, res) => {
    try {
        const uploadDir = config.UPLOAD.UPLOAD_DIR;
        
        if (!fs.existsSync(uploadDir)) {
            return res.json({
                success: true,
                files: []
            });
        }

        const files = fs.readdirSync(uploadDir)
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return config.UPLOAD.ALLOWED_EXTENSIONS.includes(ext);
            })
            .map(file => {
                const filePath = path.join(uploadDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    uploadedAt: stats.mtime,
                    path: `/uploads/${file}`
                };
            });

        res.json({
            success: true,
            count: files.length,
            files: files
        });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list files'
        });
    }
});

/**
 * DELETE /api/upload/:filename
 * Delete uploaded image
 */
router.delete('/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(config.UPLOAD.UPLOAD_DIR, filename);

        // Security check: prevent path traversal
        if (!filePath.startsWith(config.UPLOAD.UPLOAD_DIR)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file'
        });
    }
});

module.exports = router;
