/**
 * Standalone Socket.IO Server
 * 
 * This server runs independently from Next.js and handles all WebSocket connections.
 * Deploy this to Railway (or any Node.js hosting) to enable real-time features.
 */

const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8080;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Create HTTP server
const httpServer = createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
    }

    res.writeHead(404);
    res.end('Socket.IO Server');
});

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
    path: '/api/socketio',
    cors: {
        origin: CORS_ORIGIN.split(','), // Support multiple origins
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join trip room
    socket.on('join-trip', (tripId) => {
        socket.join(`trip:${tripId}`);
        console.log(`Socket ${socket.id} joined trip:${tripId}`);

        // Notify others in the room
        socket.to(`trip:${tripId}`).emit('user-joined', {
            socketId: socket.id,
            tripId,
            timestamp: new Date().toISOString(),
        });
    });

    // Leave trip room
    socket.on('leave-trip', (tripId) => {
        socket.leave(`trip:${tripId}`);
        console.log(`Socket ${socket.id} left trip:${tripId}`);

        // Notify others in the room
        socket.to(`trip:${tripId}`).emit('user-left', {
            socketId: socket.id,
            tripId,
            timestamp: new Date().toISOString(),
        });
    });

    // Message sent
    socket.on('message-sent', (data) => {
        const { tripId, message } = data;
        // Broadcast to all in trip room except sender
        socket.to(`trip:${tripId}`).emit('message-received', message);
    });

    // Activity created
    socket.on('activity-created', (data) => {
        const { tripId, activity } = data;
        // Broadcast to all in trip room
        io.to(`trip:${tripId}`).emit('activity-update', activity);
    });

    // Event created/updated/deleted
    socket.on('event-updated', (data) => {
        const { tripId, event } = data;
        socket.to(`trip:${tripId}`).emit('event-update', event);
    });

    // Expense created/updated/deleted
    socket.on('expense-updated', (data) => {
        const { tripId, expense } = data;
        socket.to(`trip:${tripId}`).emit('expense-update', expense);
    });

    // Collaborator added/removed
    socket.on('collaborator-updated', (data) => {
        const { tripId, collaborator } = data;
        socket.to(`trip:${tripId}`).emit('collaborator-update', collaborator);
    });

    // Typing indicator
    socket.on('typing-start', (data) => {
        const { tripId, userId, userName } = data;
        socket.to(`trip:${tripId}`).emit('user-typing', { userId, userName });
    });

    socket.on('typing-stop', (data) => {
        const { tripId, userId } = data;
        socket.to(`trip:${tripId}`).emit('user-stopped-typing', { userId });
    });

    // Presence updates
    socket.on('presence-update', (data) => {
        const { tripId, userId, status } = data;
        socket.to(`trip:${tripId}`).emit('presence-changed', { userId, status });
    });

    // Disconnect
    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, 'Reason:', reason);
    });

    // Error handling
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Global error handler
io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err);
});

// Start server
// Listen on 0.0.0.0 to accept connections from all network interfaces (required for Railway)
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Socket.IO server running on port ${PORT}`);
    console.log(`✓ CORS origin: ${CORS_ORIGIN}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
