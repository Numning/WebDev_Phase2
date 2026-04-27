/**
 * Authentication Web Service
 * 
 * Provides admin login functionality. Validates credentials against
 * the database and returns admin info on successful authentication.
 * 
 * ============================================================
 * POSTMAN TEST CASES
 * ============================================================
 * 
 * Test Case 1: Successful Login
 * method: POST
 * URL: http://localhost:3000/api/auth/login
 * body: raw JSON
 * {
 *   "username": "admin",
 *   "password": "admin123"
 * }
 * Expected: 200 OK with { success: true, admin: { id, username, firstName, lastName, email, role } }
 * 
 * Test Case 2: Invalid Password
 * method: POST
 * URL: http://localhost:3000/api/auth/login
 * body: raw JSON
 * {
 *   "username": "admin",
 *   "password": "wrongpassword"
 * }
 * Expected: 401 Unauthorized with { error: "Invalid username or password" }
 * 
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

/**
 * POST /api/auth/login
 * Authenticates an admin user with username and password.
 * Updates the LastLoginLog timestamp on successful login.
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Look up the user in AdminLogin joined with Administrator
        const [rows] = await pool.query(
            `SELECT al.*, a.FirstName, a.LastName, a.Email
             FROM AdminLogin al
             JOIN Administrator a ON al.AdminID = a.AdminID
             WHERE al.Username = ?`,
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const admin = rows[0];

        // Compare password with stored bcrypt hash
        const isMatch = await bcrypt.compare(password, admin.Password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Update last login timestamp
        await pool.query('UPDATE AdminLogin SET LastLoginLog = NOW() WHERE LoginID = ?', [admin.LoginID]);

        // Return success with admin info (no JWT, session managed via localStorage)
        res.json({
            success: true,
            admin: {
                id: admin.AdminID,
                username: admin.Username,
                firstName: admin.FirstName,
                lastName: admin.LastName,
                email: admin.Email,
                role: admin.Role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during authentication' });
    }
});

module.exports = router;
