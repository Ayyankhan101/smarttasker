const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../utils/multer');
const { validate, schemas } = require('../middleware/validation');

router.post('/', authMiddleware, validate(schemas.createTask), taskController.createTask);
router.get('/', authMiddleware, taskController.getTasks);
router.get('/:id', authMiddleware, taskController.getTask);
router.put('/:id', authMiddleware, validate(schemas.updateTask), taskController.updateTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);
router.post('/:id/files', authMiddleware, upload.single('file'), taskController.uploadFile);
router.get('/:id/files', authMiddleware, taskController.getFiles);
router.get('/:id/files/:fileId/download', authMiddleware, taskController.downloadFile);
router.delete('/:id/files/:fileId', authMiddleware, taskController.deleteFile);

module.exports = router;