# Aduvanta — Backend

API en [NestJS](https://nestjs.com/) para la plataforma Aduvanta: operaciones aduaneras, clientes, cumplimiento, documentos, facturación (Stripe), integraciones y más.

## Requisitos

- Node.js LTS reciente
- [pnpm](https://pnpm.io/)
- PostgreSQL (por ejemplo [Neon](https://neon.tech/))
- Redis (Redis Cloud, Upstash o `redis://localhost:6379`)

## Stack principal

| Área | Tecnología |
|------|------------|
| Framework | NestJS 11 |
| Base de datos | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) |
| Autenticación | [Better Auth](https://www.better-auth.com/) — rutas bajo `/api/auth` |
| Caché / límites | Redis ([ioredis](https://github.com/redis/ioredis)) |
| Almacenamiento | S3 compatible (AWS S3, R2, etc.) — opcional hasta que uses subida de archivos |
| Pagos | Stripe (opcional) |
| Observabilidad | OpenTelemetry, Sentry (opcional) |
| Validación | class-validator, Zod |
| Email | Resend |

El prefijo global de rutas REST es `api` (por ejemplo `/api/operations/...`). Better Auth se monta en `/api/auth/*`.

## Configuración local

1. Instalar dependencias:

```bash
pnpm install
```

2. Copiar variables de entorno:

```bash
cp .env.example .env
```

3. Editar `.env` con al menos las variables obligatorias (validadas en `src/config/config.schema.ts`):

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena PostgreSQL (`?sslmode=require` en la nube) |
| `REDIS_URL` | URL de conexión Redis |
| `BETTER_AUTH_API_KEY` | Secreto de Better Auth (≥ 32 caracteres). Si aún tienes `BETTER_AUTH_SECRET`, también se acepta |
| `BETTER_AUTH_URL` | URL pública base del API, sin path final. Ej.: `http://localhost:3000` en local, `https://api.tu-dominio.com` en producción |
| `CORS_ORIGIN` | Origen del frontend. Puede ser **varios valores separados por comas** (se recortan espacios). Ej.: `http://localhost:3001` o `https://aduvanta.com,https://www.aduvanta.com` |
| `PORT` | Puerto HTTP (por defecto `3000`) |

Variables opcionales frecuentes:

| Variable | Uso |
|----------|-----|
| `FRONTEND_URL` | URL del sitio Next (Stripe, redirecciones). Por defecto `http://localhost:3001` |
| `COOKIE_DOMAIN` | Dominio de cookies compartidas entre subdominios (p. ej. `.aduvanta.com`) si aplica |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login con Google |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PUBLISHABLE_KEY` | Facturación y webhooks |
| `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Almacenamiento de documentos y exportaciones. `S3_ENDPOINT` solo si usas proveedor compatible no-AWS |
| `ENCRYPTION_KEY` | Hex de 64 caracteres para cifrado de secretos en integraciones |
| `SENTRY_DSN` | Errores en producción |

4. Esquema y migraciones: Drizzle (`drizzle.config.ts`, esquema en `src/database/schema/`). Consulta el flujo del equipo para `drizzle-kit generate` / migraciones. Las tablas de Better Auth pueden tener un tratamiento aparte en migraciones.

## Desarrollo y producción

```bash
# Desarrollo con recarga
pnpm run start:dev

# Build y arranque producción
pnpm run build
pnpm run start:prod
```

## Scripts útiles

```bash
pnpm run lint       # ESLint
pnpm run format     # Prettier
pnpm run test       # Tests unitarios
pnpm run test:e2e   # Tests e2e
pnpm run test:cov   # Cobertura
```

## Despliegue (p. ej. Vercel)

- `BETTER_AUTH_URL` debe ser exactamente la URL pública HTTPS del mismo proyecto (por ejemplo `https://api.aduvanta.com`).
- `CORS_ORIGIN` debe incluir todos los orígenes desde los que cargue el frontend (`https://aduvanta.com`, `https://www.aduvanta.com`, etc.).
- `FRONTEND_URL` debe apuntar al dominio canónico del frontend.
- Configura el webhook de Stripe apuntando a `https://<tu-api>/api/stripe/webhooks` (o la ruta que exponga tu despliegue).

## Documentación adicional

Guías internas del proyecto en [`docs/`](./docs/README.md):

- [Actualizar dependencias](./docs/updating.md)

Referencias externas:

- [NestJS](https://docs.nestjs.com/)
- [Better Auth](https://www.better-auth.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

## Licencia

Privado — `UNLICENSED` (ver `package.json`).
