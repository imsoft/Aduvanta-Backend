# Aduvanta — Backend

API en [NestJS](https://nestjs.com/) para la plataforma Aduvanta: operaciones aduaneras, clientes, cumplimiento, facturación, integraciones y más.

## Requisitos

- Node.js LTS reciente
- [pnpm](https://pnpm.io/)
- PostgreSQL (p. ej. [Neon](https://neon.tech/))
- Redis (Redis Cloud, Upstash o instancia local)

## Stack principal

| Área | Tecnología |
|------|------------|
| Framework | NestJS 11 |
| Base de datos | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) |
| Autenticación | [Better Auth](https://www.better-auth.com/) (`/api/auth`) |
| Caché / colas | Redis ([ioredis](https://github.com/redis/ioredis)) |
| Almacenamiento | AWS S3 |
| Observabilidad | OpenTelemetry, Sentry (opcional) |
| Validación | class-validator, Zod |
| Email | Resend |

El prefijo global de la API es `api` (rutas bajo `/api/...`).

## Configuración

1. Instalar dependencias:

```bash
pnpm install
```

2. Copiar variables de entorno y ajustarlas:

```bash
cp .env.example .env
```

Variables mínimas (ver comentarios en `.env.example`):

- `DATABASE_URL` — conexión PostgreSQL
- `REDIS_URL` — conexión Redis
- `BETTER_AUTH_SECRET` — secreto seguro (≥ 32 caracteres)
- `BETTER_AUTH_URL` — URL base del backend (p. ej. `http://localhost:3000`)
- `CORS_ORIGIN` — origen del frontend (p. ej. `http://localhost:3001`)
- `PORT` — puerto del servidor (por defecto `3000`)

`SENTRY_DSN` es opcional.

3. Esquema de base de datos: Drizzle con configuración en `drizzle.config.ts` (esquema en `src/database/schema/`, migraciones generadas en `drizzle/`). Las tablas de Better Auth están excluidas del filtro de migraciones; consulta el flujo del equipo para `drizzle-kit generate` / `migrate`.

## Scripts

```bash
# Desarrollo con recarga
pnpm run start:dev

# Producción (tras build)
pnpm run build
pnpm run start:prod

# Calidad
pnpm run lint
pnpm run format

# Tests
pnpm run test
pnpm run test:e2e
pnpm run test:cov
```

## Tests

- Unitarios: `pnpm run test`
- E2E: `pnpm run test:e2e`
- Cobertura: `pnpm run test:cov`

## Documentación adicional

- [NestJS](https://docs.nestjs.com/)
- [Better Auth](https://www.better-auth.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

## Licencia

Privado — `UNLICENSED` (ver `package.json`).
