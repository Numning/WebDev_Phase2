/**
 * Game Web Services
 * 
 * Provides RESTful endpoints for game management:
 * - GET    /api/games       — Search/list all games (supports criteria)
 * - GET    /api/games/:id   — Get a single game by ID
 * - POST   /api/games       — Create (insert) a new game
 * - PUT    /api/games/:id   — Update an existing game
 * - DELETE /api/games/:id   — Delete a game
 * 
 * ============================================================
 * POSTMAN TEST CASES
 * ============================================================
 * 
 * --- Search Service (No Criteria) ---
 * Test Case 1: Get all games (no criteria)
 * method: GET
 * URL: http://localhost:3000/api/games
 * Expected: 200 OK with array of all game objects
 * 
 * Test Case 2: Search by title
 * method: GET
 * URL: http://localhost:3000/api/games?title=Elden
 * Expected: 200 OK with array of games matching "Elden" in title
 * 
 * --- Search Service (With Criteria) ---
 * Test Case 3: Search by genre
 * method: GET
 * URL: http://localhost:3000/api/games?genre=RPG
 * Expected: 200 OK with array of RPG games
 * 
 * Test Case 4: Search by price range
 * method: GET
 * URL: http://localhost:3000/api/games?minPrice=0&maxPrice=500
 * Expected: 200 OK with array of games priced between 0 and 500
 * 
 * --- Insert Service ---
 * Test Case 5: Insert a new game
 * method: POST
 * URL: http://localhost:3000/api/games
 * body: raw JSON
 * {
 *   "title": "Test Game",
 *   "genres": ["Action", "RPG"],
 *   "price": 999,
 *   "pricingType": "Regular",
 *   "salePercent": 0,
 *   "description": "A test game for Postman.",
 *   "releaseDate": "2026-01-01",
 *   "imageUrl": "https://via.placeholder.com/300",
 *   "galleryImages": ""
 * }
 * Expected: 201 Created with the new game object including GameID and Genres
 * 
 * Test Case 6: Insert a free game
 * method: POST
 * URL: http://localhost:3000/api/games
 * body: raw JSON
 * {
 *   "title": "Free Test Game",
 *   "genres": ["Casual"],
 *   "price": 0,
 *   "pricingType": "Free",
 *   "salePercent": 0,
 *   "description": "A free game for testing.",
 *   "releaseDate": "2026-03-15",
 *   "imageUrl": "",
 *   "galleryImages": ""
 * }
 * Expected: 201 Created with the new free game object
 * 
 * --- Update Service ---
 * Test Case 7: Update game title and price
 * method: PUT
 * URL: http://localhost:3000/api/games/1
 * body: raw JSON
 * {
 *   "title": "Updated Game Title",
 *   "genres": ["Action"],
 *   "price": 1299,
 *   "pricingType": "Sale",
 *   "salePercent": 25,
 *   "description": "Updated description.",
 *   "releaseDate": "2026-01-01",
 *   "imageUrl": "https://via.placeholder.com/300",
 *   "galleryImages": ""
 * }
 * Expected: 200 OK with the updated game object
 * 
 * Test Case 8: Update non-existent game
 * method: PUT
 * URL: http://localhost:3000/api/games/99999
 * body: raw JSON
 * {
 *   "title": "Ghost Game",
 *   "genres": [],
 *   "price": 0,
 *   "pricingType": "Regular",
 *   "salePercent": 0,
 *   "description": "",
 *   "releaseDate": null,
 *   "imageUrl": "",
 *   "galleryImages": ""
 * }
 * Expected: 404 Not Found with { error: "Game not found" }
 * 
 * --- Delete Service ---
 * Test Case 9: Delete a game
 * method: DELETE
 * URL: http://localhost:3000/api/games/1
 * Expected: 200 OK with { message: "Game deleted successfully" }
 * 
 * Test Case 10: Delete non-existent game
 * method: DELETE
 * URL: http://localhost:3000/api/games/99999
 * Expected: 404 Not Found with { error: "Game not found" }
 * 
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * Attaches an array of genre names to a game object.
 * Queries the GameGenre junction table and Genre table.
 * @param {Object} game - The game object to attach genres to
 * @returns {Object} The game object with a Genres array
 */
async function attachGenres(game) {
    const [genres] = await pool.query(
        'SELECT g.GenreID, g.Name FROM Genre g JOIN GameGenre gg ON g.GenreID = gg.GenreID WHERE gg.GameID = ?',
        [game.GameID]
    );
    game.Genres = genres.map(g => g.Name);
    return game;
}

/**
 * Synchronizes the GameGenre junction table for a given game.
 * Deletes existing genre mappings and inserts new ones.
 * Creates new Genre records if they don't exist yet.
 * @param {number} gameId - The ID of the game
 * @param {Array} genreNames - Array of genre name strings
 */
async function syncGameGenres(gameId, genreNames) {
    // Delete existing genre mappings for this game
    await pool.query('DELETE FROM GameGenre WHERE GameID = ?', [gameId]);
    if (!genreNames || genreNames.length === 0) return;

    // Find or create genre IDs and insert mappings
    for (const name of genreNames) {
        let [rows] = await pool.query('SELECT GenreID FROM Genre WHERE Name = ?', [name]);
        let genreId;
        if (rows.length > 0) {
            genreId = rows[0].GenreID;
        } else {
            // Create new genre if it doesn't exist
            const [result] = await pool.query('INSERT INTO Genre (Name) VALUES (?)', [name]);
            genreId = result.insertId;
        }
        await pool.query('INSERT IGNORE INTO GameGenre (GameID, GenreID) VALUES (?, ?)', [gameId, genreId]);
    }
}

/**
 * GET /api/games
 * Lists all games with optional search filters.
 * Supports: title (partial match), genre, minPrice, maxPrice, pricingType
 * No criteria = returns all games (as required by spec).
 */
router.get('/', async (req, res) => {
    try {
        const { title, genre, minPrice, maxPrice, pricingType } = req.query;
        let sql = 'SELECT DISTINCT g.* FROM Game g';
        const params = [];

        // Join with genre tables if genre filter is applied
        if (genre) {
            sql += ' JOIN GameGenre gg ON g.GameID = gg.GameID JOIN Genre gr ON gg.GenreID = gr.GenreID';
        }

        sql += ' WHERE 1=1';

        // Apply search criteria (all optional)
        if (title) {
            sql += ' AND g.Title LIKE ?';
            params.push(`%${title}%`);
        }
        if (genre) {
            sql += ' AND gr.Name = ?';
            params.push(genre);
        }
        if (minPrice) {
            sql += ' AND g.Price >= ?';
            params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            sql += ' AND g.Price <= ?';
            params.push(parseFloat(maxPrice));
        }
        if (pricingType) {
            sql += ' AND g.PricingType = ?';
            params.push(pricingType);
        }

        sql += ' ORDER BY g.ReleaseDate DESC';

        const [rows] = await pool.query(sql, params);

        // Attach genres array to each game
        const games = await Promise.all(rows.map(game => attachGenres(game)));
        res.json(games);
    } catch (err) {
        console.error('Error fetching games:', err);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

/**
 * GET /api/genres
 * Lists all available genres sorted alphabetically.
 */
router.get('/genres', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Genre ORDER BY Name ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching genres:', err);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

/**
 * GET /api/games/:id
 * Gets a single game by its ID, including attached genres.
 */
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Game WHERE GameID = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }
        const game = await attachGenres(rows[0]);
        res.json(game);
    } catch (err) {
        console.error('Error fetching game:', err);
        res.status(500).json({ error: 'Failed to fetch game' });
    }
});

/**
 * POST /api/games
 * Creates a new game record in the database.
 * Also creates genre associations via the GameGenre junction table.
 */
router.post('/', async (req, res) => {
    try {
        const { title, genres, price, pricingType, salePercent, description, releaseDate, imageUrl, galleryImages } = req.body;
        const [result] = await pool.query(
            'INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, parseFloat(price), pricingType || 'Regular', parseInt(salePercent) || 0, description || '', releaseDate || null, imageUrl || '', galleryImages || '']
        );

        // Parse genres — accepts array or JSON string
        let genreArray = genres;
        if (typeof genres === 'string') {
            try { genreArray = JSON.parse(genres); } catch (e) { genreArray = [genres]; }
        }
        await syncGameGenres(result.insertId, genreArray || []);

        const [newGame] = await pool.query('SELECT * FROM Game WHERE GameID = ?', [result.insertId]);
        const game = await attachGenres(newGame[0]);
        res.status(201).json(game);
    } catch (err) {
        console.error('Error creating game:', err);
        res.status(500).json({ error: 'Failed to create game' });
    }
});

/**
 * PUT /api/games/:id
 * Updates an existing game record and its genre associations.
 */
router.put('/:id', async (req, res) => {
    try {
        const { title, genres, price, pricingType, salePercent, description, releaseDate, imageUrl, galleryImages } = req.body;
        const [result] = await pool.query(
            'UPDATE Game SET Title=?, Price=?, PricingType=?, SalePercent=?, Description=?, ReleaseDate=?, ImageUrl=?, GalleryImages=? WHERE GameID=?',
            [title, parseFloat(price), pricingType || 'Regular', parseInt(salePercent) || 0, description || '', releaseDate || null, imageUrl || '', galleryImages || '', req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Parse genres — accepts array or JSON string
        let genreArray = genres;
        if (typeof genres === 'string') {
            try { genreArray = JSON.parse(genres); } catch (e) { genreArray = [genres]; }
        }
        await syncGameGenres(req.params.id, genreArray || []);

        const [updated] = await pool.query('SELECT * FROM Game WHERE GameID = ?', [req.params.id]);
        const game = await attachGenres(updated[0]);
        res.json(game);
    } catch (err) {
        console.error('Error updating game:', err);
        res.status(500).json({ error: 'Failed to update game' });
    }
});

/**
 * DELETE /api/games/:id
 * Deletes a game and all associated data (genres, reviews, wishlist entries)
 * via CASCADE foreign keys.
 */
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Game WHERE GameID = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.json({ message: 'Game deleted successfully' });
    } catch (err) {
        console.error('Error deleting game:', err);
        res.status(500).json({ error: 'Failed to delete game' });
    }
});

module.exports = router;
