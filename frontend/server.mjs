// Production server for Railway: serves the Angular build and the runtime config.
import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const browserDir = join(root, 'dist', 'frontend', 'browser');
const port = Number(process.env.PORT ?? 4200);
const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.error('Falta la variable de entorno API_URL (URL pública del backend).');
  process.exit(1);
}
if (!existsSync(join(browserDir, 'index.html'))) {
  console.error(`No se encontró el build en ${browserDir}. Ejecutá "npm run build".`);
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Runtime configuration: the same build works in any environment.
app.get('/config.json', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ apiUrl });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(
  express.static(browserDir, {
    index: false,
    setHeaders: (res, path) => {
      // Hashed bundles can be cached forever; everything else is revalidated.
      const hashed = /\.[0-9a-z]{8,}\.(js|css)$/i.test(path);
      res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'no-cache');
    },
  }),
);

// SPA fallback.
app.get('/{*splat}', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(join(browserDir, 'index.html'));
});

app.listen(port, () => console.log(`Frontend escuchando en el puerto ${port}`));
