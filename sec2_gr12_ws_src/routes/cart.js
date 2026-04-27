/**
 * Cart Web Services
 * 
 * Provides endpoints for managing the shopping cart:
 * - GET    /api/cart/:sessionId        — Get all cart items
 * - POST   /api/cart                    — Add a game to cart
 * - PUT    /api/cart/:cartId            — Update quantity
 * - DELETE /api/cart/:cartId            — Remove item from cart
 * - DELETE /api/cart/clear/:sessionId   — Clear entire cart
 * - GET    /api/cart/count/:sessionId   — Get cart item count
 * 
 * ============================================================
 * POSTMAN TEST CASES
 * ============================================================
 * 
 * Test Case 1: Add a game to cart
 * method: POST
 * URL: http://localhost:3000/api/cart
 * body: raw JSON
 * {
 *   "gameId": 1,
 *   "sessionId": "test-session-123"
 * }
 * Expected: 201 Created with { cartId, message: "Added to cart" }
 * 
 * Test Case 2: Get cart items
 * method: GET
 * URL: http://localhost:3000/api/cart/test-session-123
 * Expected: 200 OK with array of cart items including game details
 * 
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * GET /api/cart/count/:sessionId
 * Gets the total number of items in the cart.
 */
router.get('/count/:sessionId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT COALESCE(SUM(Quantity), 0) as count FROM Cart WHERE SessionID = ?',
            [req.params.sessionId]
        );
        res.json({ count: rows[0].count });
    } catch (err) {
        console.error('Error counting cart:', err);
        res.status(500).json({ error: 'Failed to count cart items' });
    }
});

/**
 * GET /api/cart/:sessionId
 * Gets all cart items for a session with full game details.
 */
router.get('/:sessionId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT c.CartID, c.Quantity, c.AddedAt, g.*
             FROM Cart c
             JOIN Game g ON c.GameID = g.GameID
             WHERE c.SessionID = ?
             ORDER BY c.AddedAt DESC`,
            [req.params.sessionId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

/**
 * POST /api/cart
 * Adds a game to the cart. If it already exists, increment quantity.
 */
router.post('/', async (req, res) => {
    try {
        const { gameId, sessionId } = req.body;
        if (!gameId || !sessionId) {
            return res.status(400).json({ error: 'gameId and sessionId are required' });
        }

        // Check if game already in cart
        const [existing] = await pool.query(
            'SELECT CartID, Quantity FROM Cart WHERE GameID = ? AND SessionID = ?',
            [gameId, sessionId]
        );

        if (existing.length > 0) {
            // Increment quantity
            await pool.query(
                'UPDATE Cart SET Quantity = Quantity + 1 WHERE CartID = ?',
                [existing[0].CartID]
            );
            res.json({ cartId: existing[0].CartID, message: 'Cart quantity updated' });
        } else {
            // Insert new cart item
            const [result] = await pool.query(
                'INSERT INTO Cart (GameID, SessionID, Quantity) VALUES (?, ?, 1)',
                [gameId, sessionId]
            );
            res.status(201).json({ cartId: result.insertId, message: 'Added to cart' });
        }
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

/**
 * PUT /api/cart/:cartId
 * Updates the quantity of a cart item.
 */
router.put('/:cartId', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }
        const [result] = await pool.query(
            'UPDATE Cart SET Quantity = ? WHERE CartID = ?',
            [quantity, req.params.cartId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({ message: 'Cart updated' });
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

/**
 * DELETE /api/cart/clear/:sessionId
 * Clears all items from the cart for a session.
 */
router.delete('/clear/:sessionId', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM Cart WHERE SessionID = ?',
            [req.params.sessionId]
        );
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('Error clearing cart:', err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

/**
 * DELETE /api/cart/:cartId
 * Removes a single item from the cart.
 */
router.delete('/:cartId', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM Cart WHERE CartID = ?',
            [req.params.cartId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({ message: 'Removed from cart' });
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

module.exports = router;
