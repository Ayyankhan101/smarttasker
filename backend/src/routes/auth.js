const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/2fa/setup', authMiddleware, authController.setup2FA);
router.post('/2fa/verify', validate(schemas.verify2FA), authController.verify2FA);
router.post('/2fa/disable', authMiddleware, authController.disable2FA);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;