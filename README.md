# Collaborative Todo List - Backend

Node.js backend for real-time collaborative todo app with WebSocket and Neon PostgreSQL.

## 🚀 Live Demo
- **API**: `https://collaborative-todo-backend-c4p6.onrender.com`
- **WebSocket**: `wss://collaborative-todo-backend-c4p6.onrender.com`

## 🛠️ Tech Stack
- Node.js + Express
- WebSocket (ws)
- Neon PostgreSQL
- Render (Deployment)

## 📦 Packages Used
- `express` - REST API framework
- `ws` - WebSocket server
- `@neondatabase/serverless` - PostgreSQL connection
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `uuid` - Generate unique IDs

## 🔧 Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/sanjai45-m/collaborative-todo-backend.git
cd collaborative-todo-backend
npm install
2. Database Setup (Neon)
sql
CREATE TABLE IF NOT EXISTS todos (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    device_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
3. Environment Variables
Create .env:

env
DATABASE_URL=postgresql://username:password@ep.region.neon.tech/neondb?sslmode=require
PORT=3000
4. Run
bash
npm run dev  # development
npm start    # production
📡 API Endpoints
GET /health - Server status

GET /api/todos - Get all tasks

POST /api/todos - Create task

PUT /api/todos/:id - Update task

DELETE /api/todos/:id - Delete task

PATCH /api/todos/:id/status - Update status

🔌 WebSocket Events
ADD_TODO - Broadcast new task

UPDATE_TODO - Broadcast task update

DELETE_TODO - Broadcast task deletion

UPDATE_STATUS - Broadcast status change

🏗️ Architecture
text
server.js          # Entry point
db.js             # Database connection
src/
├── config/       # Config & state
├── models/       # Database operations
├── routes/       # API routes
├── websocket/    # WebSocket server
└── middleware/   # Error handling
✨ Features Implemented
✅ Real-time CRUD operations

✅ WebSocket synchronization

✅ Device-based user tracking

✅ Auto-reconnection logic

✅ Connection timeout handling

📝 Notes
Render free tier sleeps after inactivity (30-60s wake-up)

WebSocket auto-reconnects with exponential backoff

🔗 Repository
github.com/sanjai45-m/collaborative-todo-backend

Part of Collaborative Todo App - Real-time task management ✅
