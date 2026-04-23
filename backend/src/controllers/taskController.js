const Task = require('../models/Task');
const File = require('../models/File');
const User = require('../models/User');
const Team = require('../models/Team');
const NotificationService = require('../services/notificationService');
const { emitTaskCreated, emitTaskUpdated, emitTaskDeleted, emitFileUploaded } = require('../services/socketService');
const path = require('path');
const fs = require('fs');

const createTask = (req, res) => {
    try {
        const { title, description, teamId, assignedTo } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title required' });
        }

        const taskId = Task.create(title, description, req.user.id, teamId, assignedTo);
        const task = Task.findById(taskId);
        const creator = User.findById(req.user.id);
        const assignedUser = assignedTo ? User.findById(assignedTo) : null;
        const team = teamId ? Team.findById(teamId) : null;

        NotificationService.notifyTaskCreated(task, creator, assignedUser, team);
        emitTaskCreated(task, creator);

        res.status(201).json({ message: 'Task created', taskId });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

const getTasks = (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;
        if (req.query.teamId) filters.teamId = req.query.teamId;

        if (req.user.role !== 'admin') {
            filters.owned = req.user.id;
        }

        const tasks = Task.getAll(filters);
        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
};

const getTask = (req, res) => {
    try {
        const task = Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const files = File.getByTask(task.id);
        res.json({ ...task, files });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Failed to get task' });
    }
};

const updateTask = (req, res) => {
    try {
        const { title, description, status, assignedTo, teamId, blockedReason } = req.body;
        const task = Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const oldStatus = task.status;
        const oldAssignedTo = task.assigned_to;

        Task.update(req.params.id, { title, description, status, assignedTo, teamId, blockedReason });
        
        const updatedTask = Task.findById(req.params.id);
        const updater = User.findById(req.user.id);

        if (status && status !== oldStatus) {
            NotificationService.notifyTaskUpdated(updatedTask, oldStatus, status, updater);
            if (status === 'completed') {
                NotificationService.notifyTaskCompleted(updatedTask, updater);
            }
        }

        if (assignedTo && assignedTo !== oldAssignedTo) {
            const assignedUser = User.findById(assignedTo);
            NotificationService.notifyTaskAssigned(updatedTask, assignedUser, updater);
        }

        emitTaskUpdated(updatedTask, oldStatus, updater);

        res.json({ message: 'Task updated' });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

const deleteTask = (req, res) => {
    try {
        const task = Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const files = File.getByTask(req.params.id);
        for (const file of files) {
            const fullPath = path.join(__dirname, '../../', file.filepath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        Task.delete(req.params.id);
        emitTaskDeleted(req.params.id, req.user);

        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { id: taskId } = req.params;
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID required' });
        }

        const task = Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const fileId = File.create(
            req.file.filename,
            req.file.originalname,
            req.file.path,
            req.file.mimetype,
            req.file.size,
            taskId,
            req.user.id
        );

        const file = File.findById(fileId);
        const uploader = User.findById(req.user.id);
        
        NotificationService.notifyFileUploaded(task, file, uploader);
        emitFileUploaded(task, file, uploader);

        res.json({ message: 'File uploaded', fileId });
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

const getFiles = (req, res) => {
    try {
        const files = File.getByTask(req.params.id);
        res.json(files);
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ error: 'Failed to get files' });
    }
};

const deleteFile = (req, res) => {
    try {
        const fileId = req.params.fileId;
        const filepath = File.delete(fileId);

        if (filepath) {
            const fullPath = path.join(__dirname, '../../', filepath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        res.json({ message: 'File deleted' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
};

const downloadFile = (req, res) => {
    try {
        const fileId = req.params.fileId;
        const file = File.findById(fileId);

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const fullPath = path.join(__dirname, '../../', file.filepath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.setHeader('Content-Type', file.mimetype);
        
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, uploadFile, getFiles, deleteFile, downloadFile };