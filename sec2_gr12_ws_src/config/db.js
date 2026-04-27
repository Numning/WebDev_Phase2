/**
 * Database Module
 *
 * Provides the MySQL connection pool and database initialization for GameHub.
 * - pool: A reusable connection pool for queries across route modules.
 * - initDatabase(): Creates the game_store database and runs the SQL schema
 *   file to create tables and insert seed data.
 *
 * All credentials are loaded from the .env file for portability.
 *
 * RESET: Set DB_RESET=true in .env to drop and recreate the database from
 * scratch. Useful when a teammate has an old version of the database.
 * Remember to remove DB_RESET=true after the reset so it doesn't wipe data
 * on every server restart.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// --- Connection Pool (used by route modules for queries) ---
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'game_store',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- Database Config WITHOUT database (to create it first) ---
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

const DB_NAME = process.env.DB_NAME || 'game_store';

/**
 * Initializes the database:
 * 1. If DB_RESET=true — drops and recreates the database (fresh install)
 * 2. Otherwise — creates the database if it does not exist
 * 3. Checks if tables already exist (skips seeding if so)
 * 4. Runs the SQL schema file to create tables and insert seed data
 *
 * To reset: set DB_RESET=true in .env, restart server, then remove it.
 */
async function initDatabase() {
    const connection = await mysql.createConnection(DB_CONFIG);
    const shouldReset = process.env.DB_RESET === 'true';

    if (shouldReset) {
        // ⚠️  Drop entire database and recreate from scratch
        console.log(`⚠️  DB_RESET=true — Dropping database "${DB_NAME}"...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
        console.log(`🗑️  Database "${DB_NAME}" dropped.`);
    }

    // Create database if needed
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✅ Database "${DB_NAME}" is ready.`);

    await connection.changeUser({ database: DB_NAME });

    // Check if tables already exist
    const [tables] = await connection.query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
        [DB_NAME]
    );

    if (tables.length === 0) {
        // No tables — run SQL schema file (creates tables + inserts seed data)
        console.log('📦 No tables found. Running SQL schema...');
        const schemaPath = path.join(__dirname, '..', 'sec2_gr12_database.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        // Split into individual statements and execute each one
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .filter(s => {
                const upper = s.toUpperCase();
                return !upper.startsWith('CREATE DATABASE') && !upper.startsWith('USE ');
            });

        for (const stmt of statements) {
            await connection.query(stmt);
        }

        console.log('✅ Schema created and seed data inserted.');
    } else {
        console.log('ℹ️  Tables already exist. Skipping schema import.');
    }

    await connection.end();
}

module.exports = { pool, initDatabase };
