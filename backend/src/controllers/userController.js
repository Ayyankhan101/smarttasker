const User = require('../models/User');
const bcrypt = require('bcrypt');
const { getDB, saveDB } = require('../db/connection');

const getUsers = (req, res) => {
    try {
        const users = User.getAll();
        const safeUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role
        }));
        res.json(safeUsers);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
};

const createUser = (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password and name required' });
        }

        const existing = User.findByEmail(email);
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const userId = User.create(email, passwordHash, name, role || 'user');

        res.status(201).json({ message: 'User created', userId });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

const updateUser = (req, res) => {
    try {
        const { name, role } = req.body;
        const user = User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (name) {
            const db = getDB();
            db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.params.id]);
            saveDB();
        }
        if (role && req.user.role === 'admin') {
            const db = getDB();
            db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
            saveDB();
        }

        res.json({ message: 'User updated' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

const deleteUser = (req, res) => {
    try {
        const user = User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        User.delete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };