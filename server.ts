import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type { ErrorRequestHandler } from 'express';
import { registerChatAndAuthRoutes } from './server/chat.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '8kb' }));
  registerChatAndAuthRoutes(app);

  const apiErrorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    const status = (error as { status?: unknown }).status;
    if (status === 413) {
      response.status(413).json({ error: 'request_too_large' });
      return;
    }
    response.status(400).json({ error: 'invalid_request' });
  };
  app.use('/api', apiErrorHandler);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
