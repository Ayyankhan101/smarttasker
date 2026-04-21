const { getDB, saveDB } = require('../db/connection');

class Task {
    static create(title, description, createdBy, teamId = null, assignedTo = null) {
        const db = getDB();
        db.run(
            'INSERT INTO tasks (title, description, created_by, team_id, assigned_to) VALUES (?, ?, ?, ?, ?)',
            [title, description || null, createdBy, teamId || null, assignedTo || null]
        );
        const result = db.exec('SELECT last_insert_rowid() as id');
        saveDB();
        return result[0]?.values[0]?.[0];
    }

    static findById(id) {
        const db = getDB();
        const stmt = db.prepare(`
            SELECT t.*, u.name as assigned_to_name, u.email as assigned_to_email,
                   creator.name as created_by_name, creator.email as created_by_email
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN users creator ON t.created_by = creator.id
            WHERE t.id = ?
        `);
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    }

    static getAll(filters = {}) {
        const db = getDB();
        let query = `
            SELECT t.*, u.name as assigned_to_name, u.email as assigned_to_email,
                   creator.name as created_by_name, creator.email as created_by_email,
                   team.name as team_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN users creator ON t.created_by = creator.id
            LEFT JOIN teams team ON t.team_id = team.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            query += ' AND t.status = ?';
            params.push(filters.status);
        }
        if (filters.assignedTo) {
            query += ' AND t.assigned_to = ?';
            params.push(filters.assignedTo);
        }
        if (filters.teamId) {
            query += ' AND t.team_id = ?';
            params.push(filters.teamId);
        }
        if (filters.createdBy) {
            query += ' AND t.created_by = ?';
            params.push(filters.createdBy);
        }
        if (filters.owned) {
            query += ' AND (t.created_by = ? OR t.assigned_to = ?)';
            params.push(filters.owned, filters.owned);
        }

        query += ' ORDER BY t.created_at DESC';

        const stmt = db.prepare(query);
        if (params.length) stmt.bind(params);
        
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }

    static update(id, data) {
        const db = getDB();
        const fields = [];
        const values = [];

        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.status !== undefined) {
            fields.push('status = ?');
            values.push(data.status);
            if (data.status === 'archived') {
                fields.push('archived_at = CURRENT_TIMESTAMP');
            }
        }
        if (data.assignedTo !== undefined) {
            fields.push('assigned_to = ?');
            values.push(data.assignedTo);
        }
        if (data.teamId !== undefined) {
            fields.push('team_id = ?');
            values.push(data.teamId);
        }
        if (data.blockedReason !== undefined) {
            fields.push('blocked_reason = ?');
            values.push(data.blockedReason);
        }

        if (fields.length === 0) return;

        values.push(id);
        db.run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
        saveDB();
    }

    static getUnassigned(daysOld = 7) {
        const db = getDB();
        const stmt = db.prepare(`
            SELECT t.*, u.name as assigned_to_name, creator.name as created_by_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN users creator ON t.created_by = creator.id
            WHERE t.assigned_to IS NULL 
            AND t.status NOT IN ('completed', 'archived')
            AND t.created_at < datetime('now', '-' || ? || ' days')
            ORDER BY t.created_at ASC
        `);
        stmt.bind([daysOld]);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }

    static getForArchiving(daysOld = 30) {
        const db = getDB();
        const stmt = db.prepare(`
            SELECT id FROM tasks 
            WHERE status = 'completed' 
            AND archived_at IS NULL
            AND updated_at < datetime('now', '-' || ? || ' days')
        `);
        stmt.bind([daysOld]);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }

    static archive(id) {
        const db = getDB();
        db.run('UPDATE tasks SET status = "archived", archived_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        saveDB();
    }

    static delete(id) {
        const db = getDB();
        db.run('DELETE FROM tasks WHERE id = ?', [id]);
        saveDB();
    }
}

module.exports = Task;