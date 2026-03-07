const express = require('express');
const { state } = require('../config');
const todoModel = require('../models/todoModel');
const { broadcastToAll } = require('../websocket');

const router = express.Router();

function checkDbConnection(req, res, next) {
    if (!state.isDbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
    }
    next();
}

router.use(checkDbConnection);

router.get('/', async (req, res) => {
    try {
        const todos = await todoModel.getAllTodos();
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const todos = await todoModel.getTodoById(req.params.id);
        if (todos.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todos[0]);
    } catch (error) {
        console.error('Error fetching todo:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, status, created_by, updated_by, deviceId } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newTodo = await todoModel.addTodo({
            title,
            description: description || '',
            status: status || 'pending',
            created_by: created_by || 'Anonymous',
            updated_by: updated_by || 'Anonymous',
            deviceId: deviceId
        });

        broadcastToAll({ type: 'TODO_ADDED', payload: newTodo });
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { title, description, updated_by, deviceId } = req.body;
        const { id } = req.params;

        const existing = await todoModel.getTodoById(id);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        await todoModel.updateTodo({
            id,
            title,
            description,
            updated_by: updated_by || 'Anonymous',
            deviceId: deviceId
        });

        const updated = await todoModel.getTodoById(id);
        broadcastToAll({ type: 'TODO_UPDATED', payload: updated[0] });
        res.json(updated[0]);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: error.message });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await todoModel.getTodoById(id);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        await todoModel.deleteTodo({ id });
        broadcastToAll({ type: 'TODO_DELETED', payload: { id } });
        res.json({ success: true, message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, updated_by, deviceId } = req.body;

        if (!['pending', 'in_progress', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const existing = await todoModel.getTodoById(id);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        await todoModel.updateStatus({
            id,
            status,
            updated_by: updated_by || 'Anonymous',
            deviceId: deviceId
        });

        const updated = await todoModel.getTodoById(id);
        broadcastToAll({ type: 'STATUS_UPDATED', payload: updated[0] });
        res.json(updated[0]);
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;

        if (!['pending', 'in_progress', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const todos = await todoModel.getTodosByStatus(status);
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos by status:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
