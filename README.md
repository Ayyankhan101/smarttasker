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

### Using the Startup Script (Recommended)

After cloning, you can start everything with one command:

```bash
# Clone and start
git clone https://github.com/Ayyankhan101/smarttasker.git
cd smarttasker

# Configure environment (required for email notifications)
cp backend/.env.example backend/.env
# Edit backend/.env with your settings:
# - SMTP_PASS: Gmail App Password (16 chars, not your email password)
# - JWT_SECRET: Generate a secure key

# Start everything (installs deps if needed)
./smarttasker.sh start
```

Other script commands:
```bash
./smarttasker.sh status   # Check if running
./smarttasker.sh logs    # View logs
./smarttasker.sh stop    # Stop servers
```

### Manual Setup

#### Backend

```bash
cd backend
npm install

# Configure .env
cp .env.example .env

# Start server
npm start
```

Server runs on http://localhost:5000

#### Frontend

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

## Registration Validation Requirements

When registering a new account, the following validation rules apply:

- **`name`**: Minimum 2 characters, maximum 100 characters
- **`email`**: Must be a valid email format
- **`password`**: Minimum 6 characters

If validation fails, the API returns a `400 Bad Request` with details:

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "password", "message": "Password must be at least 6 characters long" }
  ]
}
```

## Environment Variables (.env)

```env
PORT=5000
JWT_SECRET=your-secure-secret-key
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

**FRONTEND_URL**: Specifies allowed origins for CORS. When running multiple frontend instances (e.g., Vite dev server on port 5173 and Docker on port 2000), provide comma-separated origins without spaces:

```env
FRONTEND_URL=http://localhost:5173,http://localhost:2000
```

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