const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
};

const DB_NAME = 'game_store';

// ─── CSV Parser (handles quoted fields with commas) ──────────────────────────
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    fields.push(current.trim());
    return fields;
}

function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
        });
        rows.push(row);
    }
    return rows;
}

// ─── Import games from CSV ───────────────────────────────────────────────────
async function importGamesFromCSV(connection) {
    const csvPath = path.join(__dirname, '..', 'GameStock.csv');

    if (!fs.existsSync(csvPath)) {
        console.log('⚠️  GameStock.csv not found. Skipping game import.');
        return;
    }

    const games = parseCSV(csvPath);
    console.log(`📄 Found ${games.length} games in GameStock.csv. Importing...`);

    // ── Step 1: Collect unique genres ─────────────────────────────────────────
    const allGenres = new Set();
    const gameGenres = []; // { gameIndex, genres[] }

    for (const game of games) {
        let genres = [];
        if (game.Genre && game.Genre.trim()) {
            try {
                // Genre field is a JSON array like ["RPG", "Action", "Open World"]
                genres = JSON.parse(game.Genre);
            } catch {
                // Fallback: treat as comma-separated plain text
                genres = game.Genre.split(',').map(g => g.trim()).filter(Boolean);
            }
        }
        genres.forEach(g => allGenres.add(g));
        gameGenres.push(genres);
    }

    // ── Step 2: Insert genres ────────────────────────────────────────────────
    const genreNameToId = {};
    for (const name of allGenres) {
        const [result] = await connection.query(
            'INSERT INTO Genre (Name) VALUES (?)',
            [name]
        );
        genreNameToId[name] = result.insertId;
    }
    console.log(`   ✅ Inserted ${allGenres.size} genres.`);

    // ── Step 3: Insert games ─────────────────────────────────────────────────
    const gameIds = [];
    for (let i = 0; i < games.length; i++) {
        const g = games[i];

        // Parse price: remove commas (e.g. "1,890" → 1890)
        const price = parseFloat((g.Price || '0').replace(/,/g, '')) || 0;

        // Default PricingType to 'Regular' if empty
        let pricingType = (g.PricingType || '').trim();
        if (!pricingType || !['Regular', 'Sale', 'Free'].includes(pricingType)) {
            pricingType = 'Regular';
        }

        const salePercent = parseInt(g.SalePercent, 10) || 0;
        const description = g.Description || null;
        const releaseDate = g.ReleaseDate || null;
        const imageUrl = g.ImageUrl || null;

        // GalleryImages — keep as-is (JSON string) or null
        let galleryImages = null;
        if (g.GalleryImages && g.GalleryImages.trim()) {
            galleryImages = g.GalleryImages.trim();
        }

        const [result] = await connection.query(
            `INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [g.Title, price, pricingType, salePercent, description, releaseDate, imageUrl, galleryImages]
        );
        gameIds.push(result.insertId);
    }
    console.log(`   ✅ Inserted ${games.length} games.`);

    // ── Step 4: Insert game-genre mappings ────────────────────────────────────
    let mappingCount = 0;
    for (let i = 0; i < games.length; i++) {
        for (const genreName of gameGenres[i]) {
            const genreId = genreNameToId[genreName];
            if (genreId) {
                await connection.query(
                    'INSERT INTO GameGenre (GameID, GenreID) VALUES (?, ?)',
                    [gameIds[i], genreId]
                );
                mappingCount++;
            }
        }
    }
    console.log(`   ✅ Inserted ${mappingCount} game-genre mappings.`);
}

// ─── Main init function ──────────────────────────────────────────────────────
async function initDatabase() {
    // Step 1: Connect WITHOUT a database to create it if needed
    const connection = await mysql.createConnection(DB_CONFIG);

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✅ Database "${DB_NAME}" is ready.`);

    await connection.changeUser({ database: DB_NAME });

    // Step 2: Check if tables already exist (to avoid re-seeding data)
    const [tables] = await connection.query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
        [DB_NAME]
    );

    if (tables.length === 0) {
        // No tables exist yet — run the schema SQL (creates tables + admin seed)
        console.log('📦 No tables found. Running schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .filter(s => {
                const upper = s.toUpperCase();
                return !upper.startsWith('CREATE DATABASE') && !upper.startsWith('USE ');
            });

        for (const stmt of statements) {
            await connection.query(stmt);
        }
        console.log('✅ Schema created and admin data seeded.');

        // Import games from CSV
        await importGamesFromCSV(connection);
        console.log('✅ Game import from CSV complete.');
    } else {
        console.log('ℹ️  Tables already exist. Skipping schema import.');
    }

    await connection.end();
}

module.exports = initDatabase;
