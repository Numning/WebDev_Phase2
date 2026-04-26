/**
 * GameHub Backend Server
 * 
 * This is the backend API server for the GameHub application.
 * It provides RESTful web services for authentication, game management,
 * reviews, wishlists, cart, and user accounts. All data is stored in MySQL.
 * 
 * The frontend is served by a separate server (see frontend/server.js).
 */

const express = require('express');
const cors = require('cors');

const initDatabase = require('./initDb');
const gamesRouter = require('./routes/games');
const authRouter = require('./routes/auth');
const reviewsRouter = require('./routes/reviews');
const wishlistRouter = require('./routes/wishlist');
const cartRouter = require('./routes/cart');
const usersRouter = require('./routes/users');
const newsRouter = require('./routes/news');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/games', gamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/cart', cartRouter);
app.use('/api/users', usersRouter);
app.use('/api/news', newsRouter);

// Root endpoint — API info
app.get('/', (req, res) => {
    res.json({
        message: 'GameHub API Server',
        version: '1.0.0',
        endpoints: ['/api/games', '/api/auth', '/api/reviews', '/api/wishlist', '/api/cart', '/api/users', '/api/news']
    });
});

// Initialize database, then start server
async function start() {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`🎮 Game Store server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to initialize database:', err.message);
        console.error('   Make sure MySQL is running and accessible.');
        process.exit(1);
    }
}

start();
