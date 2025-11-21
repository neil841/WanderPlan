/**
 * Custom Next.js Server with Socket.io
 *
 * Required for real-time features (messaging, presence, live updates)
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  // In development, use ts-node with tsconfig-paths to load TypeScript
  // In production, use built JavaScript
  try {
    let initSocketServer;

    if (dev) {
      // Development: Register tsconfig-paths first, then ts-node
      require('tsconfig-paths/register');
      require('ts-node').register({
        project: './tsconfig.json',
        transpileOnly: true,
      });
      initSocketServer = require('./src/lib/realtime/server.ts').initSocketServer;
    } else {
      // Production: Load built JavaScript from .next/server
      initSocketServer = require('./dist/server/lib/realtime/server.js').initSocketServer;
    }

    const io = initSocketServer(httpServer);
    global.socketio = io;
    console.log('✓ Socket.io server initialized');
  } catch (err) {
    console.warn('⚠ Socket.io not initialized (real-time features disabled)');
    console.warn('  Error:', err.message);
    if (dev && err.code === 'MODULE_NOT_FOUND') {
      console.warn('  This is expected in development before first build');
      console.warn('  Run `npm run build` once to enable Socket.io');
    }
  }

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
});
