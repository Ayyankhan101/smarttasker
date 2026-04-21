const { getDB, saveDB } = require('../db/connection');

class File {
    static create(filename, originalName, filepath, mimetype, size, taskId, uploadedBy) {
        const db = getDB();
        db.run(
            'INSERT INTO files (filename, original_name, filepath, mimetype, size, task_id, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [filename, originalName, filepath, mimetype, size, taskId, uploadedBy]
        );
        const result = db.exec('SELECT last_insert_rowid() as id');
        saveDB();
        return result[0]?.values[0]?.[0];
    }

    static findById(id) {
        const db = getDB();
        const stmt = db.prepare(`
            SELECT f.*, u.name as uploaded_by_name
            FROM files f
            JOIN users u ON f.uploaded_by = u.id
            WHERE f.id = ?
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

    static getByTask(taskId) {
        const db = getDB();
        const stmt = db.prepare(`
            SELECT f.*, u.name as uploaded_by_name
            FROM files f
            JOIN users u ON f.uploaded_by = u.id
            WHERE f.task_id = ?
            ORDER BY f.created_at DESC
        `);
        stmt.bind([taskId]);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }

    static delete(id) {
        const db = getDB();
        const file = this.findById(id);
        if (file) {
            db.run('DELETE FROM files WHERE id = ?', [id]);
            saveDB();
            return file.filepath;
        }
        return null;
    }
}

module.exports = File;