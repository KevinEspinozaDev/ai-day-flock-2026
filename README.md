# VulnPrio · AI Day Flock 2026

App interna para **priorizar vulnerabilidades**: subís el Excel del escaneo y te devuelve, en una pantalla simple, el resumen priorizado por **severidad e impacto**.

| | |
|---|---|
| **Frontend** | Angular 22 (standalone + signals), Angular Material, Chart.js, SheetJS |
| **Backend** | Node + Express 5 + TypeScript, JWT (`jsonwebtoken`), bcrypt, Postgres |
| **Deploy** | Railway: 3 servicios (frontend, backend, Postgres) |

## Estructura del monorepo

```
.
├── assets/vulnerabilidades-ejemplo.xlsx   # Excel de ejemplo para probar la subida
├── backend/                               # API de autenticación (JWT)
├── frontend/                              # App Angular
├── scripts/generate_sample_excel.py       # Regenera el Excel de ejemplo
└── docker-compose.yml                     # Postgres para desarrollo local
```

### Clean architecture

Las dos apps separan las capas por feature: el dominio no depende de Angular, de Express ni de librerías externas.

```
frontend/src/app/
├── core/            # config en runtime, interceptor JWT, guards, i18n
├── layout/shell/    # menú lateral + barra superior con el menú de usuario
└── features/
    ├── auth/
    │   ├── domain/          # modelos y puertos (AuthRepository, SessionStorage)
    │   ├── application/     # AuthFacade (login / logout)
    │   ├── infrastructure/  # adaptadores: HTTP y localStorage
    │   └── presentation/    # página de login
    └── vulnerabilities/
        ├── domain/          # política de prioridad, resumen, validación de archivos, mapeo de filas
        ├── application/     # caso de uso de importación + store con signals
        ├── infrastructure/  # adaptadores: SheetJS y sessionStorage
        └── presentation/    # Subir Excel, Dashboard, wrapper de Chart.js

backend/src/
├── domain/          # entidades, puertos y errores
├── application/     # casos de uso: Login, GetCurrentUser, SeedAdmin
├── infrastructure/  # Postgres, bcrypt, JWT
├── interfaces/http/ # Express: rutas y middlewares
└── main.ts          # composition root
```

## Cómo se prioriza

```
riesgo (0-100) = CVSS × 10 × criticidad del activo × exploit × exposición
```

| Factor | Valores |
|---|---|
| Criticidad del activo (impacto) | Alta ×1 · Media ×0,8 · Baja ×0,6 |
| Exploit disponible | ×1,2 |
| Expuesto a Internet | ×1,15 |
| Sin CVSS | se usa el punto medio de la severidad (Crítica 9,5 · Alta 7,5 · Media 5,5 · Baja 2,5) |

**Prioridad:** P1 ≥ 90 · P2 ≥ 70 · P3 ≥ 40 · P4 < 40. Solo se priorizan las vulnerabilidades *Abiertas* y *En progreso*.

Para cambiar los pesos, editá `frontend/src/app/features/vulnerabilities/domain/priority.policy.ts`.

## Validación del Excel

- Formatos: `.xlsx`, `.xlsm`, `.xls`, `.ods`, `.xltx` y `.xltm`, con un máximo de 5 MB.
- Se verifica la **firma real del archivo** (magic bytes): un archivo renombrado a `.xlsx` se rechaza.
- Columnas obligatorias: **ID, Título, Severidad, Activo**. Los encabezados se aceptan en español o en inglés.
- Las filas inválidas (ID duplicado, CVSS fuera de rango, severidad desconocida…) se omiten y se informan con su número de fila.
- No se evalúan fórmulas ni macros. El archivo se procesa en el navegador y **no se sube al servidor**.

## Desarrollo local

Requisitos: Node 22.22.3+ o 24.15+, y Docker (o un Postgres propio).

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend (http://localhost:3000)
cd backend
cp .env.example .env        # en Windows: copy .env.example .env
npm install
npm run dev

# 3. Frontend (http://localhost:4200), en otra terminal
cd frontend
npm install
npm start
```

Usuario inicial: `admin` / `Admin1234!` (lo crea el backend la primera vez, a partir de `SEED_ADMIN_*` en `.env`).

Tests: `npm test` en `backend/` y en `frontend/`.

## Deploy en Railway

Creá un proyecto en Railway desde este repo de GitHub, con tres servicios:

1. **Postgres:** *New → Database → PostgreSQL*.
2. **backend:** *New → GitHub Repo*. En *Settings → Root Directory* poné `/backend` (toma el `backend/railway.json`). Variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<secreto aleatorio de 32+ caracteres>
   JWT_EXPIRES_IN=8h
   CORS_ORIGIN=https://<dominio-del-frontend>.up.railway.app
   SEED_ADMIN_USERNAME=admin
   SEED_ADMIN_PASSWORD=<contraseña segura>
   SEED_ADMIN_DISPLAY_NAME=Administrador
   ```
   En *Settings → Networking*, generá un dominio público.
3. **frontend:** *New → GitHub Repo*. En *Root Directory* poné `/frontend`. Variable:
   ```
   API_URL=https://<dominio-del-backend>.up.railway.app
   ```
   Generá también su dominio público y copialo en `CORS_ORIGIN` del backend.

El frontend lee `API_URL` en runtime (`/config.json`, servido por `server.mjs`), así que el mismo build sirve para cualquier entorno.

Para generar el secreto JWT:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## API

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | `{ username, password }` → `{ accessToken, expiresIn, user }`. Limitado a 20 intentos cada 15 minutos. |
| `GET` | `/api/auth/me` | Perfil del usuario (requiere `Authorization: Bearer <token>`) |
| `GET` | `/health` | Healthcheck que también verifica la conexión a la DB |

El logout es del lado del cliente: borra el JWT del `localStorage` y el reporte importado.
