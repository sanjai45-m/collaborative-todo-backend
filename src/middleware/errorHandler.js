function notFoundHandler(req, res, next) {
    if (res.headersSent) {
        return next();
    }

    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: {
            get: ['/', '/health', '/api/todos', '/api/todos/:id', '/api/todos/status/:status', 
                  '/api/stats', '/api/search', '/api/devices', '/api/devices/:deviceId/stats'],
            post: ['/api/todos'],
            put: ['/api/todos/:id'],
            delete: ['/api/todos/:id'],
            patch: ['/api/todos/:id/status']
        }
    });
}

function globalErrorHandler(err, req, res, next) {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
}

module.exports = { notFoundHandler, globalErrorHandler };
