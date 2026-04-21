const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = User.findById(decoded.userId);
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.user.email} (${socket.id})`);

        socket.join(`user_${socket.user.id}`);
        if (socket.user.role === 'admin') {
            socket.join('admin_room');
        }

        socket.on('join_task', (taskId) => {
            socket.join(`task_${taskId}`);
            console.log(`[Socket] ${socket.user.email} joined task_${taskId}`);
        });

        socket.on('leave_task', (taskId) => {
            socket.leave(`task_${taskId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.user.email}`);
        });
    });

    console.log('[Socket] Socket.io initialized');
    return io;
}

function getIO() {
    return io;
}

function emitTaskCreated(task, creator) {
    if (!io) return;
    io.emit('task:created', { task, creator });
    console.log(`[Socket] Emitted task:created - "${task.title}"`);
}

function emitTaskUpdated(task, oldStatus, user) {
    if (!io) return;
    io.emit('task:updated', { task, oldStatus, user });
    console.log(`[Socket] Emitted task:updated - "${task.title}"`);
}

function emitTaskDeleted(taskId, user) {
    if (!io) return;
    io.emit('task:deleted', { taskId, user });
    console.log(`[Socket] Emitted task:deleted - ID ${taskId}`);
}

function emitFileUploaded(task, file, user) {
    if (!io) return;
    io.to(`task_${task.id}`).emit('file:uploaded', { task, file, user });
    console.log(`[Socket] Emitted file:uploaded - "${file.original_name}"`);
}

function emitNotification(userId, notification) {
    if (!io) return;
    io.to(`user_${userId}`).emit('notification', notification);
    console.log(`[Socket] Emitted notification to user_${userId}`);
}

module.exports = { initSocket, getIO, emitTaskCreated, emitTaskUpdated, emitTaskDeleted, emitFileUploaded, emitNotification };