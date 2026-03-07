const express = require('express');
const { applyMiddleware } = require('./middleware');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const rootRoutes = require('./routes');
const todoRoutes = require('./routes/todoRoutes');
const apiRoutes = require('./routes/apiRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();

applyMiddleware(app);

app.use('/', rootRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
