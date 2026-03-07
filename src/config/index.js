require('dotenv').config();

const PORT = process.env.PORT || 3000;

const state = {
    clients: new Map(),
    isDbConnected: false
};

module.exports = { PORT, state };
