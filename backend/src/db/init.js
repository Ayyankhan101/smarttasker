const { getDB, saveDB } = require('./connection');

function initDatabase() {
    const db = getDB();
    console.log('Initializing database...');

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
            totp_secret TEXT,
            is_2fa_enabled INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Users table created');

    db.run(`
        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Teams table created');

    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'created' CHECK(status IN ('created', 'in_progress', 'completed', 'archived', 'blocked')),
            assigned_to INTEGER,
            team_id INTEGER,
            created_by INTEGER NOT NULL,
            blocked_reason TEXT,
            archived_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log('Tasks table created');

    db.run(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            filepath TEXT NOT NULL,
            mimetype TEXT,
            size INTEGER,
            task_id INTEGER NOT NULL,
            uploaded_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log('Files table created');

    db.run(`
        CREATE TABLE IF NOT EXISTS user_teams (
            user_id INTEGER NOT NULL,
            team_id INTEGER NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, team_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
        )
    `);
    console.log('User_teams table created');

    saveDB();
    console.log('Database initialization complete!');
}

module.exports = { initDatabase };