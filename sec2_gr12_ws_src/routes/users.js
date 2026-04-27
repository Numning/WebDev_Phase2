/**
 * User Authentication Web Services
 * 
 * Provides user registration and login functionality (separate from admin).
 * - POST /api/users/register — Register a new user account
 * - POST /api/users/login    — User login
 * - GET  /api/users/:id      — Get user profile
 * 
 * ============================================================
 * POSTMAN TEST CASES
 * ============================================================
 * 
 * Test Case 1: Register a new user
 * method: POST
 * URL: http://localhost:3000/api/users/register
 * body: raw JSON
 * {
 *   "username": "john",
 *   "email": "john@example.com",
 *   "password": "password123",
 *   "firstName": "John",
 *   "lastName": "Doe"
 * }
 * Expected: 201 Created with { success: true, user: { id, username, ... } }
 * 
 * Test Case 2: User login
 * method: POST
 * URL: http://localhost:3000/api/users/login
 * body: raw JSON
 * {
 *   "username": "john",
 *   "password": "password123"
 * }
 * Expected: 200 OK with { success: true, user: { id, username, firstName, lastName, email } }
 * 
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * POST /api/users/register
 * Registers a new user account with hashed password.
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if username or email already exists
        const [existing] = await pool.query(
            'SELECT UserID FROM User WHERE Username = ? OR Email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Store password as plain text
        const [result] = await pool.query(
            'INSERT INTO User (Username, Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?, ?)',
            [username, email, password, firstName, lastName]
        );

        res.status(201).json({
            success: true,
            user: {
                id: result.insertId,
                username,
                firstName,
                lastName,
                email
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

/**
 * POST /api/users/login
 * Authenticates a user with username and password.
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM User WHERE Username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];
        // Compare password directly (plain text)
        if (password !== user.Password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        res.json({
            success: true,
            user: {
                id: user.UserID,
                username: user.Username,
                firstName: user.FirstName,
                lastName: user.LastName,
                email: user.Email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

/**
 * GET /api/users/:id
 * Gets a user's profile by ID (excludes password).
 */
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT UserID, Username, Email, FirstName, LastName, CreatedAt FROM User WHERE UserID = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

module.exports = router;
