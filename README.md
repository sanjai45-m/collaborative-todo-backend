<div align="center">

# 🗂️ Collaborative Todo List — Backend

**Real-time collaborative task management API built with Node.js, WebSocket & Neon PostgreSQL**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Enabled-4A90D9?style=for-the-badge&logo=websocket&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

---

### 🌐 Live Demo

| Service   | URL                                                              |
|-----------|------------------------------------------------------------------|
| 🔗 API       | `https://collaborative-todo-backend-c4p6.onrender.com`       |
| ⚡ WebSocket | `wss://collaborative-todo-backend-c4p6.onrender.com`         |

</div>

---

## 📖 Table of Contents

- [Tech Stack](#-tech-stack)
- [Packages Used](#-packages-used)
- [Setup Instructions](#-setup-instructions)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [Architecture](#-architecture)
- [Features](#-features)
- [Notes](#-notes)

---

## 🛠️ Tech Stack

| Technology          | Purpose                  |
|---------------------|--------------------------|
| **Node.js**         | Runtime environment      |
| **Express 5.x**     | REST API framework       |
| **WebSocket (ws)**  | Real-time communication  |
| **Neon PostgreSQL** | Serverless database      |
| **Render**          | Cloud deployment         |

---

## 📦 Packages Used

| Package                      | Description                    |
|------------------------------|--------------------------------|
| `express`                    | REST API framework             |
| `ws`                         | WebSocket server               |
| `@neondatabase/serverless`   | Neon PostgreSQL connection     |
| `cors`                       | Cross-origin resource sharing  |
| `dotenv`                     | Environment variable management|
| `uuid`                       | Unique ID generation           |
| `nodemon` *(dev)*            | Auto-restart during development|

---

## 🔧 Setup Instructions

### 1️⃣ Clone & Install

```bash
git clone https://github.com/sanjai45-m/collaborative-todo-backend.git
cd collaborative-todo-backend
npm install
```

### 2️⃣ Database Setup (Neon PostgreSQL)

Run the following SQL on your Neon console to create the required table:

```sql
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
```

### 3️⃣ Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://username:password@ep.region.neon.tech/neondb?sslmode=require
PORT=3000
```

### 4️⃣ Run the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

| Method   | Endpoint                  | Description         |
|----------|---------------------------|---------------------|
| `GET`    | `/health`                 | Server health check |
| `GET`    | `/api/todos`              | Get all tasks       |
| `POST`   | `/api/todos`              | Create a new task   |
| `PUT`    | `/api/todos/:id`          | Update a task       |
| `DELETE` | `/api/todos/:id`          | Delete a task       |
| `PATCH`  | `/api/todos/:id/status`   | Update task status  |

---

## 🔌 WebSocket Events

| Event           | Description                       |
|-----------------|-----------------------------------|
| `ADD_TODO`      | Broadcast when a new task is added|
| `UPDATE_TODO`   | Broadcast when a task is updated  |
| `DELETE_TODO`   | Broadcast when a task is deleted  |
| `UPDATE_STATUS` | Broadcast when status changes     |

> **💡 Tip:** WebSocket auto-reconnects with exponential backoff on connection loss.

---

## 🏗️ Architecture

```
collaborative-todo-backend/
├── server.js              # Entry point
├── db.js                  # Database connection & pooling
├── package.json           # Dependencies & scripts
├── .env                   # Environment variables
└── src/
    ├── config/            # App configuration & shared state
    ├── models/            # Database operations (CRUD)
    ├── routes/            # Express API route handlers
    ├── websocket/         # WebSocket server & event handling
    └── middleware/         # Error handling & middlewares
```

---

## ✨ Features

- ✅ **Real-time CRUD** — Create, read, update, and delete tasks instantly
- ✅ **WebSocket Sync** — All connected clients receive live updates
- ✅ **Device Tracking** — Identify users by device for collaboration
- ✅ **Auto-Reconnection** — Smart reconnect with exponential backoff
- ✅ **Connection Timeout** — Graceful handling of idle connections
- ✅ **Modular Architecture** — Clean separation of concerns

---

## 📝 Notes

> [!NOTE]
> Render free tier instances sleep after 15 minutes of inactivity. The first request after sleep may take **30–60 seconds** to wake up.

> [!TIP]
> The WebSocket client automatically reconnects with exponential backoff, so brief disconnects are handled gracefully.

---

<div align="center">

## 🔗 Repository

**[github.com/sanjai45-m/collaborative-todo-backend](https://github.com/sanjai45-m/collaborative-todo-backend)**

---

*Part of the **Collaborative Todo App** — Real-time task management ✅*

Made with ❤️ by [sanjai45-m](https://github.com/sanjai45-m)

</div>
