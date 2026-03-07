const WebSocket = require('ws');
const { state } = require('../config');
const todoModel = require('../models/todoModel');

function broadcastToAll(message) {
    const messageStr = JSON.stringify(message);
    state.clients.forEach((clientInfo, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
    console.log(`📢 Broadcasted ${message.type} to ${state.clients.size} clients`);
}

async function sendCurrentTodos(ws) {
    try {
        const todos = await todoModel.getAllTodos();
        ws.send(JSON.stringify({
            type: 'INITIAL_TODOS',
            payload: todos
        }));
        console.log('📤 Sent initial todos to new client');
    } catch (error) {
        console.error('Error sending initial todos:', error);
        ws.send(JSON.stringify({
            type: 'ERROR',
            payload: { message: 'Failed to fetch todos' }
        }));
    }
}

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('🔌 New client connected');
        
        // Store client with empty device info initially
        state.clients.set(ws, { deviceId: null, deviceName: null });

        if (state.isDbConnected) {
            sendCurrentTodos(ws);
        } else {
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Database connection unavailable' }
            }));
        }

        ws.on('message', async (message) => {
            if (!state.isDbConnected) {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { message: 'Database not connected' }
                }));
                return;
            }

            try {
                const data = JSON.parse(message);
                console.log('📨 Received:', data.type);

                // Extract device info from payload
                const deviceId = data.payload?.deviceId;
                const deviceName = data.payload?.deviceName;

                // Track device if we have the info
                if (deviceId) {
                    const clientInfo = state.clients.get(ws);
                    if (clientInfo) {
                        clientInfo.deviceId = deviceId;
                        clientInfo.deviceName = deviceName || 'Unknown';
                        state.clients.set(ws, clientInfo);
                    }
                    await todoModel.trackDevice(deviceId, deviceName);
                }

                switch (data.type) {
                    case 'ADD_TODO':
                        const newTodo = await todoModel.addTodo(data.payload);
                        if (deviceId) await todoModel.incrementDeviceTaskCount(deviceId);
                        broadcastToAll({ type: 'TODO_ADDED', payload: newTodo });
                        break;
                    case 'UPDATE_TODO':
                        await todoModel.updateTodo(data.payload);
                        broadcastToAll({ type: 'TODO_UPDATED', payload: data.payload });
                        break;
                    case 'DELETE_TODO':
                        await todoModel.deleteTodo(data.payload);
                        broadcastToAll({ type: 'TODO_DELETED', payload: data.payload });
                        break;
                    case 'UPDATE_STATUS':
                        await todoModel.updateStatus(data.payload);
                        broadcastToAll({ type: 'STATUS_UPDATED', payload: data.payload });
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { message: error.message }
                }));
            }
        });

        ws.on('close', () => {
            console.log('🔌 Client disconnected');
            state.clients.delete(ws);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    return wss;
}

module.exports = { setupWebSocket, broadcastToAll };