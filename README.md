# SmartTasker

Team Task Management System with JWT Authentication, 2FA, Real-time Updates, and Email Notifications.

## Features

- **Authentication**: JWT-based auth with Google Authenticator 2FA
- **Task Management**: Create, assign, track tasks with status workflow
- **Team Management**: Admin-only team CRUD
- **File Uploads**: Attach files to tasks
- **Real-time Updates**: WebSocket notifications for task changes
- **Email Notifications**: Gmail SMTP for task updates
- **Auto-Archiving**: Tasks auto-archived after 30 days

## Tech Stack

- **Backend**: Node.js + Express + SQLite (sql.js)
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: JWT + Google Authenticator (speakeasy)
- **Real-time**: Socket.io
- **Email**: Nodemailer

## Quick Start

### Prerequisites

- Node.js 18+
- Gmail account (for notifications)

### Backend Setup

```bash
cd backend
npm install

# Configure .env
cp .env.example .env
# Edit .env with your SMTP credentials:
# - SMTP_PASS: Gmail App Password (not email password)
# - JWT_SECRET: Generate a secure key

# Start server
npm start
```

Server runs on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:5173

## Environment Variables (.env)

```env
PORT=5000
JWT_SECRET=your-secure-secret-key
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173

# Gmail SMTP (App Password, not email password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/2fa/setup` - Enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `GET /api/auth/profile` - Get current user

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/files` - Upload file

### Teams (Admin only)
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

## Project Structure

```
smarttasker/
├── backend/
│   ├── src/
│   │   ├── index.js       # Entry point
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Data models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth & validation
│   │   ├── db/         # Database
│   │   └── utils/      # Utilities
│   └── .env            # Configuration
│
└── frontend/
    ├── src/
    │   ├── pages/       # Page components
    │   ├── components/ # Reusable components
    │   ├── context/    # React contexts
    │   ├── api/        # API client
    │   └── hooks/      # Custom hooks
    └── package.json
```

## License

MIT