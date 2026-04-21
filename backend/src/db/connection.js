const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../../smarttasker.db');

let db;

async function initDB() {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }
    
    return db;
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call initDB() first.');
    }
    return db;
}

function saveDB() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

module.exports = { initDB, getDB, saveDB };