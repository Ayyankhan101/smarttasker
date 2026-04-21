import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    register: (data) => client.post('/auth/register', data),
    login: (data) => client.post('/auth/login', data),
    setup2FA: () => client.post('/auth/2fa/setup'),
    verify2FA: (data) => client.post('/auth/2fa/verify', data),
    disable2FA: () => client.post('/auth/2fa/disable'),
    getProfile: () => client.get('/auth/profile'),
};

export const tasks = {
    getAll: (params) => client.get('/tasks', { params }),
    get: (id) => client.get(`/tasks/${id}`),
    create: (data) => client.post('/tasks', data),
    update: (id, data) => client.put(`/tasks/${id}`, data),
    delete: (id) => client.delete(`/tasks/${id}`),
    uploadFile: (taskId, formData) => client.post(`/tasks/${taskId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getFiles: (taskId) => client.get(`/tasks/${taskId}/files`),
    deleteFile: (taskId, fileId) => client.delete(`/tasks/${taskId}/files/${fileId}`),
};

export const teams = {
    getAll: () => client.get('/teams'),
    getMyTeams: () => client.get('/teams/my-teams'),
    get: (id) => client.get(`/teams/${id}`),
    create: (data) => client.post('/teams', data),
    update: (id, data) => client.put(`/teams/${id}`, data),
    delete: (id) => client.delete(`/teams/${id}`),
    addMember: (id, userId) => client.post(`/teams/${id}/members`, { userId }),
    removeMember: (id, userId) => client.delete(`/teams/${id}/members`, { data: { userId } }),
    getMembers: (id) => client.get(`/teams/${id}/members`),
};

export const users = {
    getAll: () => client.get('/users'),
    create: (data) => client.post('/users', data),
    update: (id, data) => client.put(`/users/${id}`, data),
    delete: (id) => client.delete(`/users/${id}`),
};

export default client;