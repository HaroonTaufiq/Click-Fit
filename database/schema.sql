-- ============================================
-- Click Fit Database Schema
-- MySQL Database Setup Script
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS clickfit;

-- Use the database
USE clickfit;

-- ============================================
-- USERS TABLE
-- ============================================

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type ENUM('admin', 'user') DEFAULT 'user',
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    INDEX idx_email (email),
    INDEX idx_type (type),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STORED PROCEDURE: addUser
-- ============================================

-- Drop procedure if exists
DROP PROCEDURE IF EXISTS addUser;

-- Change delimiter for stored procedure
DELIMITER //

-- Create stored procedure to add new user
CREATE PROCEDURE addUser(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_type ENUM('admin', 'user')
)
BEGIN
    -- Declare variables
    DECLARE v_userId INT;
    
    -- Insert new user
    INSERT INTO users (email, password, type, active)
    VALUES (p_email, p_password, IFNULL(p_type, 'user'), TRUE);
    
    -- Get the inserted user ID
    SET v_userId = LAST_INSERT_ID();
    
    -- Return the new user ID
    SELECT v_userId AS userId;
END //

-- Reset delimiter
DELIMITER ;

-- ============================================
-- SAMPLE DATA: Insert test user
-- ============================================

-- Call stored procedure to insert a sample user
-- Note: In production, password should be hashed (e.g., using bcrypt)
CALL addUser('demo@clickfit.com', 'demo123', 'user');

-- Insert an admin user
CALL addUser('admin@clickfit.com', 'admin123', 'admin');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify table structure
DESCRIBE users;

-- Verify stored procedure exists
SHOW PROCEDURE STATUS WHERE Db = 'clickfit' AND Name = 'addUser';

-- Verify inserted data
SELECT * FROM users;

-- ============================================
-- USEFUL QUERIES FOR TESTING
-- ============================================

-- Example: Get all active users
-- SELECT * FROM users WHERE active = TRUE;

-- Example: Get users by type
-- SELECT * FROM users WHERE type = 'admin';

-- Example: Update user status
-- UPDATE users SET active = FALSE WHERE userId = 1;

-- Example: Call addUser procedure
-- CALL addUser('newuser@example.com', 'password123', 'user');
