const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
require('dotenv').config();

const register = (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password and name are required' });
        }

        const existingUser = User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const userId = User.create(email, passwordHash, name);

        const token = jwt.sign(
            { userId, email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: userId, email, name, role: 'user' }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.is_2fa_enabled) {
            return res.json({
                requires2FA: true,
                tempToken: jwt.sign(
                    { userId: user.id, pending: true },
                    process.env.JWT_SECRET,
                    { expiresIn: '5m' }
                )
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

const setup2FA = (req, res) => {
    try {
        const user = req.user;
        const secret = speakeasy.generateSecret({
            name: `SmartTasker (${user.email})`,
            issuer: 'SmartTasker'
        });

        User.update2FASecret(user.id, secret.base32, false);

        res.json({
            message: '2FA setup initiated. Enter this code in Google Authenticator:',
            secret: secret.base32
        });
    } catch (error) {
        console.error('Setup 2FA error:', error);
        res.status(500).json({ error: '2FA setup failed' });
    }
};

const verify2FA = (req, res) => {
    try {
        const { tempToken, code } = req.body;

        if (!tempToken || !code) {
            return res.status(400).json({ error: 'Token and verification code required' });
        }

        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.pending) {
            return res.status(400).json({ error: 'Invalid temporary token' });
        }

        const user = User.findById(decoded.userId);
        if (!user || !user.totp_secret) {
            return res.status(400).json({ error: 'User not found or 2FA not set up' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.totp_secret,
            encoding: 'base32',
            token: code,
            window: 1
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        User.update2FASecret(user.id, user.totp_secret, true);

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            message: '2FA verified successfully',
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({ error: '2FA verification failed' });
    }
};

const disable2FA = (req, res) => {
    try {
        const user = req.user;
        User.update2FASecret(user.id, null, false);
        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
};

const getProfile = (req, res) => {
    try {
        const user = User.findById(req.user.id);
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is2FAEnabled: user.is_2fa_enabled,
            createdAt: user.created_at
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

module.exports = { register, login, setup2FA, verify2FA, disable2FA, getProfile };