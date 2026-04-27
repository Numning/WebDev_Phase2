/**
 * Review Web Services
 * 
 * Provides endpoints for managing game reviews:
 * - GET    /api/reviews/:gameId       — Get all reviews for a game
 * - GET    /api/reviews/stats/:gameId — Get rating stats for a game
 * - POST   /api/reviews               — Submit a new review
 * - DELETE /api/reviews/:id           — Delete a review
 * 
 * ============================================================
 * POSTMAN TEST CASES
 * ============================================================
 * 
 * Test Case 1: Get reviews for a game
 * method: GET
 * URL: http://localhost:3000/api/reviews/1
 * Expected: 200 OK with array of review objects for game ID 1
 * 
 * Test Case 2: Submit a new review
 * method: POST
 * URL: http://localhost:3000/api/reviews
 * body: raw JSON
 * {
 *   "gameId": 1,
 *   "reviewerName": "TestUser",
 *   "rating": 5,
 *   "comment": "Amazing game!"
 * }
 * Expected: 201 Created with the new review object
 * 
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * GET /api/reviews/:gameId
 * Gets all reviews for a specific game, sorted by newest first.
 */
router.get('/:gameId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Review WHERE GameID = ? ORDER BY CreatedAt DESC',
            [req.params.gameId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

/**
 * GET /api/reviews/stats/:gameId
 * Gets the average rating, total review count, and rating distribution
 * (percentage per star level) for a specific game.
 */
router.get('/stats/:gameId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT AVG(Rating) as averageRating, COUNT(*) as totalReviews FROM Review WHERE GameID = ?',
            [req.params.gameId]
        );
        const stats = rows[0];

        // Get distribution of ratings (5-star to 1-star)
        const [dist] = await pool.query(
            'SELECT Rating, COUNT(*) as Count FROM Review WHERE GameID = ? GROUP BY Rating ORDER BY Rating DESC',
            [req.params.gameId]
        );
        const distribution = [0, 0, 0, 0, 0]; // index 0 = 5 stars, index 4 = 1 star
        dist.forEach(d => {
            distribution[5 - d.Rating] = d.Count;
        });

        // Convert counts to percentages
        const total = parseInt(stats.totalReviews) || 1;
        const percentages = distribution.map(c => Math.round((c / total) * 100));

        res.json({
            averageRating: stats.averageRating ? parseFloat(stats.averageRating).toFixed(1) : '0.0',
            totalReviews: parseInt(stats.totalReviews),
            distribution: percentages
        });
    } catch (err) {
        console.error('Error fetching review stats:', err);
        res.status(500).json({ error: 'Failed to fetch review stats' });
    }
});

/**
 * POST /api/reviews
 * Submits a new review for a game.
 * Requires gameId, reviewerName, and rating (1-5). Comment is optional.
 */
router.post('/', async (req, res) => {
    try {
        const { gameId, reviewerName, rating, comment } = req.body;
        if (!gameId || !reviewerName || !rating) {
            return res.status(400).json({ error: 'gameId, reviewerName, and rating are required' });
        }
        const [result] = await pool.query(
            'INSERT INTO Review (GameID, ReviewerName, Rating, Comment) VALUES (?, ?, ?, ?)',
            [gameId, reviewerName, parseInt(rating), comment || '']
        );
        const [newReview] = await pool.query('SELECT * FROM Review WHERE ReviewID = ?', [result.insertId]);
        res.status(201).json(newReview[0]);
    } catch (err) {
        console.error('Error creating review:', err);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

/**
 * DELETE /api/reviews/:id
 * Deletes a review by its ID.
 */
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Review WHERE ReviewID = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
