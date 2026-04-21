const { getDB, saveDB } = require('../db/connection');

class Team {
    static create(name, description = null) {
        const db = getDB();
        db.run('INSERT INTO teams (name, description) VALUES (?, ?)', [name, description]);
        const result = db.exec('SELECT last_insert_rowid() as id');
        saveDB();
        return result[0]?.values[0]?.[0];
    }

    static findById(id) {
        const db = getDB();
        const stmt = db.prepare('SELECT * FROM teams WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    }

    static getAll() {
        const db = getDB();
        const result = db.exec('SELECT * FROM teams ORDER BY created_at DESC');
        if (!result[0]) return [];
        const columns = result[0].columns;
        return result[0].values.map(row => {
            const obj = {};
            columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    }

    static update(id, name, description) {
        const db = getDB();
        db.run('UPDATE teams SET name = ?, description = ? WHERE id = ?', [name, description, id]);
        saveDB();
    }

    static delete(id) {
        const db = getDB();
        db.run('DELETE FROM teams WHERE id = ?', [id]);
        saveDB();
    }

    static addMember(userId, teamId) {
        const db = getDB();
        try {
            db.run('INSERT OR IGNORE INTO user_teams (user_id, team_id) VALUES (?, ?)', [userId, teamId]);
            saveDB();
        } catch (e) {}
    }

    static removeMember(userId, teamId) {
        const db = getDB();
        db.run('DELETE FROM user_teams WHERE user_id = ? AND team_id = ?', [userId, teamId]);
        saveDB();
    }

    static getMembers(teamId) {
        const db = getDB();
        const stmt = db.prepare(`
            SELECT u.id, u.email, u.name, u.role 
            FROM users u 
            JOIN user_teams ut ON u.id = ut.user_id 
            WHERE ut.team_id = ?
        `);
        stmt.bind([teamId]);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }

    static getUserTeams(userId) {
        const db = getDB();
        const stmt = db.prepare(`
            SELECT t.* FROM teams t 
            JOIN user_teams ut ON t.id = ut.team_id 
            WHERE ut.user_id = ?
        `);
        stmt.bind([userId]);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }
}

module.exports = Team;