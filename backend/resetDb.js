const mysql = require('mysql2/promise');
const initDatabase = require('./initDb');

const DB_CONFIG = {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
};

async function resetDatabase() {
    try {
        const connection = await mysql.createConnection(DB_CONFIG);
        
        console.log('🗑️  Dropping database "game_store"...');
        await connection.query('DROP DATABASE IF EXISTS game_store');
        console.log('✅ Database dropped.');
        
        await connection.end();

        console.log('🔄 Re-initializing database...');
        await initDatabase();
        
        console.log('✨ Database reset complete! You can now start the server.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting database:', err.message);
        process.exit(1);
    }
}

resetDatabase();
