/**
 * GameHub Frontend Server
 * 
 * This is a simple Express server that serves static frontend files.
 * It runs on port 5500, separate from the backend API server (port 3000).
 * This separation is required by the project specification.
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.FE_PORT || 5500;

// Serve all static files (HTML, CSS, JS, images) from the current directory
app.use(express.static(path.join(__dirname)));

// Fallback: serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the frontend server
app.listen(PORT, () => {
    console.log(`🌐 GameHub frontend running at http://localhost:${PORT}`);
    console.log(`   Make sure the backend server is also running on port 3000.`);
});
