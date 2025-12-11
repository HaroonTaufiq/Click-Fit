/**
 * Database Connection Module
 * Handles MySQL connection pool and initialization
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('./config');

let pool = null;

/**
 * Create database connection pool
 * @returns {Object} MySQL connection pool
 */
function createPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: config.DB.host,
            user: config.DB.user,
            password: config.DB.password,
            database: config.DB.database,
            waitForConnections: config.DB.waitForConnections,
            connectionLimit: config.DB.connectionLimit,
            queueLimit: config.DB.queueLimit
        });
    }
    return pool;
}

/**
 * Create database if it doesn't exist
 * @returns {Promise<void>}
 */
async function createDatabaseIfNotExists() {
    const connection = await mysql.createConnection({
        host: config.DB.host,
        user: config.DB.user,
        password: config.DB.password
    });

    try {
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.DB.database}`);
        console.log(`✓ Database '${config.DB.database}' ready`);
    } finally {
        await connection.end();
    }
}

/**
 * Execute SQL script file
 * @param {string} scriptPath - Path to SQL script
 * @returns {Promise<void>}
 */
async function executeSqlScript(scriptPath) {
    const pool = createPool();
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    // Split script into individual statements
    const statements = script
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
        try {
            // Handle DELIMITER for stored procedures
            if (statement.includes('CREATE PROCEDURE') || statement.includes('DELIMITER')) {
                continue; // Skip, we'll handle stored procedure separately
            }
            await pool.execute(statement);
        } catch (error) {
            // Ignore "already exists" errors
            if (!error.message.includes('already exists')) {
                console.warn(`Warning executing statement: ${error.message}`);
            }
        }
    }
}

/**
 * Initialize database schema
 * Creates tables and stored procedures
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
    try {
        // Create database first
        await createDatabaseIfNotExists();
        
        // Create pool connection
        const pool = createPool();

        // Create users table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                userId INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                type ENUM('admin', 'user') DEFAULT 'user',
                active BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Users table ready');

        // Drop existing stored procedure if exists, then create
        // Note: Using query() instead of execute() for stored procedure creation
        // because CREATE PROCEDURE with BEGIN...END is not supported in prepared statements
        const connection = await pool.getConnection();
        try {
            await connection.query('DROP PROCEDURE IF EXISTS addUser');
            await connection.query(`
                CREATE PROCEDURE addUser(
                    IN p_email VARCHAR(255),
                    IN p_password VARCHAR(255),
                    IN p_type ENUM('admin', 'user')
                )
                BEGIN
                    INSERT INTO users (email, password, type, active)
                    VALUES (p_email, p_password, IFNULL(p_type, 'user'), TRUE);
                    
                    SELECT LAST_INSERT_ID() AS userId;
                END
            `);
            console.log('✓ Stored procedure addUser created');
        } finally {
            connection.release();
        }

        // Insert sample user using stored procedure (if not exists)
        try {
            await pool.query(`CALL addUser('demo@clickfit.com', 'demo123', 'user')`);
            console.log('✓ Sample user created');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log('✓ Sample user already exists');
            } else {
                console.log('✓ Sample user check completed');
            }
        }

        console.log('✓ Database initialization complete');
    } catch (error) {
        console.error('Database initialization error:', error.message);
        console.log('⚠ Server will continue without database functionality');
    }
}

/**
 * Get database pool
 * @returns {Object} MySQL connection pool
 */
function getPool() {
    return createPool();
}

/**
 * Close database connections
 * @returns {Promise<void>}
 */
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

module.exports = {
    initializeDatabase,
    getPool,
    closePool
};
