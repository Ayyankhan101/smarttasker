const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', authMiddleware, userController.getUsers);
router.post('/', authMiddleware, adminOnly, userController.createUser);
router.put('/:id', authMiddleware, adminOnly, userController.updateUser);
router.delete('/:id', authMiddleware, adminOnly, userController.deleteUser);

module.exports = router;