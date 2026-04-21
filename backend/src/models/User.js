const { getDB, saveDB } = require('../db/connection');

class User {
    static create(email, passwordHash, name, role = 'user') {
        const db = getDB();
        db.run('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)', [email, passwordHash, name, role]);
        const result = db.exec('SELECT last_insert_rowid() as id');
        saveDB();
        return result[0]?.values[0]?.[0];
    }

    static findByEmail(email) {
        const db = getDB();
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        stmt.bind([email]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    }

    static findById(id) {
        const db = getDB();
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    }

    static update2FASecret(id, totpSecret, enabled = true) {
        const db = getDB();
        db.run('UPDATE users SET totp_secret = ?, is_2fa_enabled = ? WHERE id = ?', [totpSecret, enabled ? 1 : 0, id]);
        saveDB();
    }

    static getAll() {
        const db = getDB();
        const result = db.exec('SELECT id, email, name, role, is_2fa_enabled, created_at FROM users');
        if (!result[0]) return [];
        const columns = result[0].columns;
        return result[0].values.map(row => {
            const obj = {};
            columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    }

    static delete(id) {
        const db = getDB();
        db.run('DELETE FROM users WHERE id = ?', [id]);
        saveDB();
    }
}

module.exports = User;