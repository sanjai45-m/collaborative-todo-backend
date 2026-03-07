const http = require('http');
const app = require('./src/app');
const { PORT, state } = require('./src/config');
const { setupWebSocket } = require('./src/websocket');
const { testConnection, initDatabase } = require('./db');

const server = http.createServer(app);

setupWebSocket(server);

async function startServer() {
    console.log('🚀 Starting server...');
    console.log('📁 Current directory:', __dirname);
    console.log('🔍 Checking environment...');

    state.isDbConnected = await testConnection();

    if (state.isDbConnected) {
        await initDatabase();
    } else {
        console.warn('⚠️ Server starting without database connection');
        console.warn('⚠️ Will retry database connection every 30 seconds');

        setInterval(async () => {
            if (!state.isDbConnected) {
                console.log('🔄 Retrying database connection...');
                state.isDbConnected = await testConnection();
                if (state.isDbConnected) {
                    console.log('✅ Database connection re-established');
                    await initDatabase();
                }
            }
        }, 30000);
    }

    server.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log(`✅ SERVER IS RUNNING!`);
        console.log('='.repeat(50));
        console.log(`📡 HTTP:  http://localhost:${PORT}`);
        console.log(`📡 WebSocket:  ws://localhost:${PORT}`);
        console.log(`🏥 Health:  http://localhost:${PORT}/health`);
        console.log(`📊 Stats:   http://localhost:${PORT}/api/stats`);
        console.log(`📋 Todos:   http://localhost:${PORT}/api/todos`);
        console.log('='.repeat(50));
        console.log(`💾 Database: ${state.isDbConnected ? '✅ Connected' : '❌ Disconnected'}`);
        console.log(`👥 WebSocket clients: 0`);
        console.log('='.repeat(50));
    });
}

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');

    state.clients.forEach((clientInfo, client) => {
        client.close();
    });

    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

startServer().catch(console.error);