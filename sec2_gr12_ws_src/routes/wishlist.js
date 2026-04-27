/**
 * Wishlist Web Services
 * 
 * Provides endpoints for session-based game wishlisting:
 * - GET    /api/wishlist/:sessionId           — Get wishlisted games
 * - POST   /api/wishlist                       — Add to wishlist
 * - DELETE /api/wishlist/:sessionId/:gameId    — Remove from wishlist
 * - GET    /api/wishlist/check/:sessionId/:gId — Check if wishlisted
 * 
 * ============================================================
 * POSTMAN TEST CASES
 * ============================================================
 * 
 * Test Case 1: Add a game to wishlist
 * method: POST
 * URL: http://localhost:3000/api/wishlist
 * body: raw JSON
 * {
 *   "gameId": 1,
 *   "sessionId": "test-session-123"
 * }
 * Expected: 201 Created with { wishlistId, message: "Added to wishlist" }
 * 
 * Test Case 2: Check if a game is wishlisted
 * method: GET
 * URL: http://localhost:3000/api/wishlist/check/test-session-123/1
 * Expected: 200 OK with { wishlisted: true }
 * 
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * GET /api/wishlist/:sessionId
 * Gets all wishlisted games for a session, including full game details.
 */
router.get('/:sessionId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT w.WishlistID, w.AddedAt, g.*
             FROM Wishlist w
             JOIN Game g ON w.GameID = g.GameID
             WHERE w.SessionID = ?
             ORDER BY w.AddedAt DESC`,
            [req.params.sessionId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching wishlist:', err);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

/**
 * POST /api/wishlist
 * Adds a game to the user's wishlist. Uses session ID for user identification.
 * Returns 409 Conflict if the game is already in the wishlist.
 */
router.post('/', async (req, res) => {
    try {
        const { gameId, sessionId } = req.body;
        if (!gameId || !sessionId) {
            return res.status(400).json({ error: 'gameId and sessionId are required' });
        }
        const [result] = await pool.query(
            'INSERT INTO Wishlist (GameID, SessionID) VALUES (?, ?)',
            [gameId, sessionId]
        );
        res.status(201).json({ wishlistId: result.insertId, message: 'Added to wishlist' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Game already in wishlist' });
        }
        console.error('Error adding to wishlist:', err);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

/**
 * DELETE /api/wishlist/:sessionId/:gameId
 * Removes a game from the user's wishlist.
 */
router.delete('/:sessionId/:gameId', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM Wishlist WHERE SessionID = ? AND GameID = ?',
            [req.params.sessionId, req.params.gameId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Wishlist entry not found' });
        }
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error('Error removing from wishlist:', err);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

/**
 * GET /api/wishlist/check/:sessionId/:gameId
 * Checks whether a specific game is in the user's wishlist.
 * Returns { wishlisted: true/false }.
 */
router.get('/check/:sessionId/:gameId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT WishlistID FROM Wishlist WHERE SessionID = ? AND GameID = ?',
            [req.params.sessionId, req.params.gameId]
        );
        res.json({ wishlisted: rows.length > 0 });
    } catch (err) {
        console.error('Error checking wishlist:', err);
        res.status(500).json({ error: 'Failed to check wishlist' });
    }
});

module.exports = router;
