# Planora

> Project management that adapts to your team

Planora is a beautiful, intuitive project management platform built for modern teams. It offers the power of monday.com with a cleaner, more focused experience.

## 🚀 Features

- **Multiple Views**: List, Board, Timeline, Calendar, and Gantt charts
- **Real-time Collaboration**: Live updates, comments, and mentions
- **Smart Automations**: Workflow automation without code
- **Time Tracking**: Built-in time tracking and reporting
- **Custom Fields**: Fully customizable to match your workflow
- **Integrations**: Connect with 100+ tools

## 📋 MVP Components

### Authentication (`@custom/auth/`)
- Email/password login and signup
- Password reset flow
- Email verification
- Session management
- OAuth2 support (Google, GitHub)

### Dashboard (`@custom/dashboard/`)
- Project overview
- Task management (create, edit, delete, assign)
- Multiple view modes:
  - List view (default)
  - Kanban board
  - Calendar view
  - Timeline/Gantt (Pro)
- Filters and sorting
- Search functionality

### Core Features (`@custom/`)
- **Projects**: Create and manage projects
- **Tasks**: Full CRUD operations with subtasks
- **Comments**: Real-time commenting system
- **Attachments**: File upload and management
- **Team Management**: Invite members, set permissions
- **Notifications**: In-app and email notifications
- **Activity Feed**: Track all project changes

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- Zustand for state management
- React DnD for drag-and-drop

### Backend
- Node.js + Express
- PostgreSQL database
- Prisma ORM
- JWT authentication
- WebSocket for real-time updates

### Infrastructure
- Docker containerization
- Railway deployment
- AWS S3 for file storage
- SendGrid for email

## 📦 Project Structure

```
planora/
├── @custom/              # Custom application code
│   ├── auth/            # Authentication logic
│   ├── dashboard/       # Dashboard components
│   ├── api/             # API routes
│   ├── db/              # Database migrations & seeds
│   └── components/      # Shared UI components
├── @system/             # System/framework code
│   ├── auth-provider/   # Auth infrastructure
│   ├── db-client/       # Database client
│   └── email/           # Email service
├── landing/             # Marketing landing page
├── docs/                # Documentation
└── info.js              # Product metadata
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Installation

```bash
# Clone and install dependencies
cd products/planora
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database and API keys

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Docker Setup

```bash
# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts
- `organizations` - Teams/workspaces
- `projects` - Projects within orgs
- `tasks` - Tasks within projects
- `comments` - Task comments
- `attachments` - File attachments
- `activity_logs` - Audit trail

## 🔐 Authentication Flow

1. User signs up with email/password
2. Verification email sent
3. User confirms email
4. JWT token issued
5. Token stored in httpOnly cookie
6. Refresh token flow for session persistence

## 📱 API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/projects/:projectId/tasks` - List tasks
- `POST /api/projects/:projectId/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/assign` - Assign task
- `POST /api/tasks/:id/comments` - Add comment

## 🎨 Design System

Colors follow the brand guidelines defined in `info.js`:
- Primary: `#6366f1` (Indigo)
- Background: `#0f172a` (Slate-900)
- Success: `#10b981` (Emerald)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

- Email: support@planora.app
- Docs: https://docs.planora.app
- Status: https://status.planora.app
