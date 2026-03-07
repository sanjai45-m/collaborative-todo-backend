const express = require('express');
const { state } = require('../config');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        name: 'Collaborative Todo API',
        version: '1.0.0',
        status: state.isDbConnected ? 'connected' : 'degraded',
        endpoints: {
            health: '/health',
            todos: '/api/todos',
            websocket: 'ws://localhost:3000'
        },
        documentation: {
            get_all_todos: 'GET /api/todos',
            create_todo: 'POST /api/todos',
            update_todo: 'PUT /api/todos/:id',
            delete_todo: 'DELETE /api/todos/:id',
            update_status: 'PATCH /api/todos/:id/status'
        }
    });
});

router.get('/health', (req, res) => {
    res.json({
        status: state.isDbConnected ? 'healthy' : 'degraded',
        database: state.isDbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        connections: state.clients.size,
        memory: process.memoryUsage()
    });
});

module.exports = router;
