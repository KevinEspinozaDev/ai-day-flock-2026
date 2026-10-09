import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error-handler.js';
import { type AuthRoutesDeps, authRoutes } from './routes/auth.routes.js';

export interface AppDeps extends AuthRoutesDeps {
  corsOrigins: string[];
  healthCheck?: () => Promise<void>;
}

export function createApp(deps: AppDeps): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: deps.corsOrigins, methods: ['GET', 'POST'] }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await deps.healthCheck?.();
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.use('/api/auth', authRoutes(deps));
  app.use((_req, res) => {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Ruta no encontrada' });
  });
  app.use(errorHandler);

  return app;
}
