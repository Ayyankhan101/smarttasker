import { useEffect, useCallback, useState } from 'react';
import { useSocket } from './SocketContext';

export function useTaskUpdates(taskId, onUpdate) {
    const { socket } = useSocket();
    const [task, setTask] = useState(null);

    const handleTaskCreated = useCallback((data) => {
        onUpdate?.(data);
    }, [onUpdate]);

    const handleTaskUpdated = useCallback((data) => {
        if (taskId && data.task.id !== parseInt(taskId)) return;
        setTask(data.task);
        onUpdate?.(data);
    }, [taskId, onUpdate]);

    const handleTaskDeleted = useCallback((data) => {
        if (taskId && data.taskId !== parseInt(taskId)) return;
        onUpdate?.(data);
    }, [taskId, onUpdate]);

    useEffect(() => {
        if (!socket) return;

        socket.on('task:created', handleTaskCreated);
        socket.on('task:updated', handleTaskUpdated);
        socket.on('task:deleted', handleTaskDeleted);

        if (taskId) {
            socket.emit('join_task', taskId);
        }

        return () => {
            socket.off('task:created', handleTaskCreated);
            socket.off('task:updated', handleTaskUpdated);
            socket.off('task:deleted', handleTaskDeleted);
            if (taskId) {
                socket.emit('leave_task', taskId);
            }
        };
    }, [socket, taskId, handleTaskCreated, handleTaskUpdated, handleTaskDeleted]);

    return { task };
}

export function useNotifications() {
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 50));
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket]);

    const clear = useCallback(() => {
        setNotifications([]);
    }, []);

    return { notifications, clear };
}