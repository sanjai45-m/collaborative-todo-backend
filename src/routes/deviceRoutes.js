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

router.get('/', async (req, res) => {
    try {
        const devices = await todoModel.getAllDevices();
        res.json(devices);
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:deviceId/stats', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const stats = await todoModel.getDeviceStats(deviceId);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching device stats:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;