/**
 * News Route — Public API Proxy for FreeToGame
 * 
 * Proxies requests to the FreeToGame API to show latest free-to-play
 * game releases on the homepage. This API is completely free and
 * requires NO API key — works out of the box.
 * 
 * GET /api/news — Returns latest free-to-play game releases
 * 
 * API Docs: https://www.freetogame.com/api-doc
 */

const express = require('express');
const https = require('https');
const router = express.Router();

/**
 * GET /api/news
 * Fetches the latest free-to-play game releases from the FreeToGame API.
 * No API key needed — this is a fully free public web service.
 */
router.get('/', async (req, res) => {
    // FreeToGame API — fetch latest PC games sorted by release date
    const url = 'https://www.freetogame.com/api/games?sort-by=release-date&platform=all';

    try {
        const games = await fetchJSON(url);

        // Handle invalid responses
        if (!Array.isArray(games) || games.length === 0) {
            return res.status(502).json({
                error: 'No games found',
                message: 'FreeToGame API returned no results'
            });
        }

        // Take the 9 most recent releases and format them as "news" articles
        const articles = games.slice(0, 9).map(game => ({
            title: game.title,
            description: game.short_description,
            url: game.game_url,
            image: game.thumbnail,
            source: {
                name: game.publisher || game.developer || 'FreeToGame'
            },
            publishedAt: game.release_date,
            genre: game.genre,
            platform: game.platform
        }));

        res.json({
            totalArticles: articles.length,
            articles
        });
    } catch (err) {
        console.error('Failed to fetch gaming news:', err.message);
        res.status(502).json({
            error: 'Failed to fetch gaming news',
            message: err.message
        });
    }
});

/**
 * Helper: Fetch JSON from a URL using Node.js built-in https module.
 * No external dependencies needed (no node-fetch required).
 * @param {string} url - The URL to fetch
 * @returns {Promise<Object>} Parsed JSON response
 */
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let body = '';
            response.on('data', chunk => { body += chunk; });
            response.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error('Invalid JSON response from FreeToGame'));
                }
            });
        }).on('error', reject);
    });
}

module.exports = router;
