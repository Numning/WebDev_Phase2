/**
 * GameHub Frontend Server
 * 
 * Express server that serves static frontend files with clean URL routes.
 * Uses Express Router to map clean paths (e.g. /home, /games) to HTML files.
 * Runs on port 5500, separate from the backend API server (port 3000).
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.FE_PORT || 5500;

// --- Static files (CSS, JS, images) ---
// Serve css, js, and other static assets from the current directory
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// --- Page Routes (Clean URLs) ---
// Each route serves the corresponding HTML file

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Search / Browse Games
app.get('/games', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

// Game Detail
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'detail.html'));
});

// Shopping Cart
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

// Wishlist
app.get('/wishlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'wishlist.html'));
});

// User Login / Register
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-login.html'));
});

// Team Page
app.get('/team', (req, res) => {
    res.sendFile(path.join(__dirname, 'team.html'));
});

// Admin Login
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Admin Dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- Backward Compatibility ---
// Keep old .html URLs working (redirect to clean URLs)
app.get('/index.html', (req, res) => res.redirect(301, '/home'));
app.get('/search.html', (req, res) => {
    // Preserve query parameters when redirecting
    const query = Object.keys(req.query).length ? '?' + new URLSearchParams(req.query).toString() : '';
    res.redirect(301, '/games' + query);
});
app.get('/detail.html', (req, res) => {
    const query = Object.keys(req.query).length ? '?' + new URLSearchParams(req.query).toString() : '';
    res.redirect(301, '/game' + query);
});
app.get('/cart.html', (req, res) => res.redirect(301, '/cart'));
app.get('/wishlist.html', (req, res) => res.redirect(301, '/wishlist'));
app.get('/user-login.html', (req, res) => res.redirect(301, '/account'));
app.get('/team.html', (req, res) => res.redirect(301, '/team'));
app.get('/login.html', (req, res) => res.redirect(301, '/admin/login'));
app.get('/admin.html', (req, res) => res.redirect(301, '/admin'));

// Start the frontend server
app.listen(PORT, () => {
    console.log(`🌐 GameHub frontend running at http://localhost:${PORT}`);
    console.log(`   Routes: /home, /games, /game, /cart, /wishlist, /account, /team, /admin`);
    console.log(`   Make sure the backend server is also running on port 3000.`);
});
