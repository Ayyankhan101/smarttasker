const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const { initDB } = require('./db/connection');
const { initDatabase } = require('./db/init');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const ArchiveService = require('./services/archiveService');
const NotificationService = require('./services/notificationService');
const { initSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);
app.set('trust proxy', true);


const CORS_ORIGINS = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:2000', 'http://127.0.0.1:5173', 'http://127.0.0.1:2000'];

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/admin/archive', (req, res) => {
    const archivedCount = ArchiveService.checkAndArchive(30);
    const unassigned = ArchiveService.getUnassignedWarnings(7);
    res.json({ 
        message: 'Archive check complete', 
        tasksArchived: archivedCount,
        unassignedWarnings: unassigned.length 
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

let archiveInterval;

async function startServer() {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('[Init] Created uploads directory');
    }
    
    await initDB();
    initDatabase();
    NotificationService.init();
    initSocket(server);
    
    archiveInterval = setInterval(() => {
        console.log('[Cron] Running archive check...');
        ArchiveService.checkAndArchive(30);
        ArchiveService.getUnassignedWarnings(7);
    }, 24 * 60 * 60 * 1000);
    
    console.log('[Cron] Archive job scheduled (every 24 hours)');
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

process.on('SIGTERM', () => {
    clearInterval(archiveInterval);
});

startServer().catch(console.error);

module.exports = app;