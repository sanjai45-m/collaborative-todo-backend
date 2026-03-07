const express = require('express');
const { state } = require('../config');
const todoModel = require('../models/todoModel');

const router = express.Router();

function checkDbConnection(req, res, next) {
    if (!state.isDbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
    }
    next();
}

router.use(checkDbConnection);

router.get('/stats', async (req, res) => {
    try {
        const stats = await todoModel.getStats();
        res.json({
            ...stats,
            active_connections: state.clients.size
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const todos = await todoModel.searchTodos(q);
        res.json(todos);
    } catch (error) {
        console.error('Error searching todos:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
