# Aduvanta — Backend

API REST en [NestJS](https://nestjs.com/) para la plataforma Aduvanta: operaciones aduaneras, clasificación arancelaria, pedimentos, padrón de importadores, IMMEX, tesorería, facturación, integraciones y más.

## Requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | LTS (≥ 20) |
| pnpm | ≥ 9 |
| PostgreSQL | ≥ 15 (recomendado: [Neon](https://neon.tech/)) |
| Redis | ≥ 7 (Redis Cloud, Upstash o local) |

## Stack

| Área | Tecnología |
|---|---|
| Framework | NestJS 11 + Express 5 |
| Base de datos | PostgreSQL vía [Drizzle ORM](https://orm.drizzle.team/) 0.45 |
| Autenticación | [Better Auth](https://www.better-auth.com/) 1.6 — rutas bajo `/api/auth` |
| Caché / rate-limit | Redis ([ioredis](https://github.com/redis/ioredis)) |
| Almacenamiento | S3-compatible (AWS S3, Cloudflare R2, etc.) |
| Pagos | Stripe 20 |
| Email | Resend |
| Observabilidad | OpenTelemetry + Sentry |
| Logging | Pino + nestjs-pino |
| Validación | class-validator + Zod 4 |
| API docs | Swagger / OpenAPI (`/api/docs`) |

El prefijo global de todas las rutas REST es `/api`. Better Auth se monta en `/api/auth/*`.

---

## Configuración local

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

**Obligatorias:**

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL (`?sslmode=require` en Neon) |
| `REDIS_URL` | URL de Redis (`redis://localhost:6379` en local) |
| `BETTER_AUTH_API_KEY` | Secreto de Better Auth (≥ 32 caracteres) |
| `BETTER_AUTH_URL` | URL pública del API sin path. Ej: `http://localhost:3000` |
| `CORS_ORIGIN` | Origen(es) del frontend, separados por coma. Ej: `http://localhost:3001` |

**Opcionales frecuentes:**

| Variable | Uso |
|---|---|
| `FRONTEND_URL` | URL del frontend para redirecciones (default: `http://localhost:3001`) |
| `COOKIE_DOMAIN` | Dominio compartido de cookies. Ej: `.aduvanta.com` |
| `PORT` | Puerto HTTP (default: `3000`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth con Google |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PUBLISHABLE_KEY` | Facturación y webhooks Stripe |
| `S3_BUCKET` / `S3_REGION` / `S3_ENDPOINT` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Almacenamiento de documentos |
| `ENCRYPTION_KEY` | Hex de 64 caracteres para cifrado de secretos en integraciones |
| `RESEND_API_KEY` | Envío de emails transaccionales |
| `SENTRY_DSN` | Reporte de errores en producción |
| `EXCHANGE_RATE_API_KEY` | Tasas de cambio de mercado ([exchangerate-api.com](https://www.exchangerate-api.com) — gratis 1 500 req/mes) |
| `BANXICO_TOKEN` | Tipo de cambio FIX oficial SAT ([banxico.org.mx](https://www.banxico.org.mx/SieAPIRest/service/v1/)) |

### 3. Migraciones

La base de datos usa Drizzle Kit con historial de migraciones en `drizzle/`.

```bash
# Generar SQL a partir del schema (solo si modificaste schemas)
npx drizzle-kit generate

# Aplicar migraciones pendientes a la base de datos
npx drizzle-kit migrate
```

> **Nota:** Si la base de datos fue inicializada con `drizzle-kit push` (sin historial), aplica directamente los archivos `.sql` de `drizzle/` que no estén en la tabla `__drizzle_migrations`.

### 4. Iniciar en desarrollo

```bash
pnpm run start:dev
```

La API queda disponible en `http://localhost:3000/api`.
Documentación Swagger en `http://localhost:3000/api/docs`.

---

## Scripts

```bash
pnpm run build         # Compilar TypeScript → dist/
pnpm run start:prod    # Arrancar build de producción
pnpm run start:dev     # Desarrollo con hot-reload
pnpm run lint          # ESLint con auto-fix
pnpm run format        # Prettier
pnpm run test          # Tests unitarios (Jest)
pnpm run test:e2e      # Tests end-to-end
pnpm run test:cov      # Cobertura de tests
```

---

## Módulos

Monolito modular con ~55 módulos. Cada uno tiene controller, service, repository y DTOs propios.

### Fundación

| Módulo | Ruta base | Descripción |
|---|---|---|
| `auth` | `/api/auth` | Sesiones y autenticación (Better Auth) |
| `users` | `/api/users` | Gestión de usuarios |
| `organizations` | `/api/organizations` | Multi-tenancy — cada organización es un tenant |
| `memberships` | `/api/memberships` | Vinculación usuario ↔ organización |
| `roles` | `/api/roles` | Roles por organización |
| `permissions` | `/api/permissions` | Permisos y RBAC |
| `audit-logs` | `/api/audit-logs` | Trazabilidad de mutaciones sensibles |
| `health` | `/api/health` | Health check |
| `storage` | `/api/storage` | Subida y descarga de archivos S3 |
| `email` | — | Envío transaccional con Resend |
| `notifications` | `/api/notifications` | Notificaciones in-app |

### Operaciones aduaneras

| Módulo | Ruta base | Descripción |
|---|---|---|
| `customs-entries` | `/api/customs-entries` | Pedimentos de importación/exportación |
| `customs-operations` | `/api/customs-operations` | Tráfico / operaciones aduaneras |
| `customs-inspections` | `/api/customs-inspections` | Reconocimientos y semáforo |
| `customs-previos` | `/api/customs-previos` | Previos de mercancía |
| `customs-rectifications` | `/api/customs-rectifications` | Rectificaciones de pedimentos |
| `customs-valuation` | `/api/customs-valuation` | Valoración aduanera |
| `e-documents` | `/api/e-documents` | COVE y documentos electrónicos |
| `saai-generator` | `/api/saai-generator` | Generación de archivos para SAAI |
| `saai-errors` | `/api/saai-errors` | Catálogo de errores SAAI |
| `tariff-classification` | `/api/tariff-classification` | Clasificación arancelaria TIGIE |
| `anexo22` | `/api/anexo22` | Catálogos SAT Anexo 22 (13 tablas) |

### Padrón e IMMEX

| Módulo | Ruta base | Descripción |
|---|---|---|
| `importer-registry` | `/api/importer-registry` | Padrón de importadores (general y sectorial) |
| `immex-programs` | `/api/immex-programs` | Programas IMMEX y operaciones virtuales |

### Clientes y cuenta corriente

| Módulo | Ruta base | Descripción |
|---|---|---|
| `clients` | `/api/clients` | Directorio de clientes |
| `client-accounts` | `/api/client-accounts` | Cuenta corriente, movimientos y estados de cuenta |
| `client-addresses` | `/api/client-addresses` | Domicilios de clientes |
| `client-contacts` | `/api/client-contacts` | Contactos de clientes |
| `client-portal-access` | `/api/client-portal-access` | Acceso al portal cliente |

### Operaciones y finanzas

| Módulo | Ruta base | Descripción |
|---|---|---|
| `operations` | `/api/operations` | Expedientes de operación |
| `operation-charges` | `/api/operation-charges` | Cargos por operación |
| `operation-advances` | `/api/operation-advances` | Anticipos por operación |
| `operation-finance` | `/api/operation-finance` | Finanzas consolidadas |
| `operation-compliance` | `/api/operation-compliance` | Evaluación de cumplimiento |
| `treasury` | `/api/treasury` | Tesorería |

### Infraestructura operativa

| Módulo | Ruta base | Descripción |
|---|---|---|
| `warehouse` | `/api/warehouse` | Inventario y movimientos de almacén |
| `cupo-letters` | `/api/cupo-letters` | Cartas cupo |
| `documents` | `/api/documents` | Gestión documental |
| `document-categories` | `/api/document-categories` | Categorías de documentos |
| `document-management` | `/api/document-management` | Administración de documentos |
| `compliance-rule-sets` | `/api/compliance/rule-sets` | Conjuntos de reglas de cumplimiento |
| `compliance-document-requirements` | `/api/compliance/document-requirements` | Requisitos documentales |
| `compliance-status-rules` | `/api/compliance/status-rules` | Reglas de transición de estado |

### Facturación y pagos

| Módulo | Ruta base | Descripción |
|---|---|---|
| `billing` | `/api/billing` | Suscripciones y planes |
| `stripe` | `/api/stripe` | Pagos y webhooks Stripe |
| `subscriptions` | `/api/subscriptions` | Estado de suscripción por organización |

### Plataforma y herramientas

| Módulo | Ruta base | Descripción |
|---|---|---|
| `analytics` | `/api/analytics` | Dashboard de KPIs y reportes ejecutivos |
| `exchange-rates` | `/api/exchange-rates` | Tipos de cambio: mercado (ExchangeRate-API) y FIX SAT (Banxico) |
| `unit-converter` | `/api/unit-converter` | Conversor de unidades |
| `ai` | `/api/ai` | Copiloto IA |
| `integrations` | `/api/integrations` | Integraciones con sistemas externos |
| `imports` / `exports` | `/api/imports` `/api/exports` | Jobs de importación/exportación masiva |
| `feature-flags` | `/api/feature-flags` | Flags de funcionalidad por organización |
| `usage` | `/api/usage` | Métricas de uso por plan |
| `portal` | `/api/portal` | Portal de clientes externos |
| `system-admin` | `/api/system-admin` | Administración de la plataforma |

---

## Arquitectura

```
src/
├── config/          # Esquema de variables de entorno (Zod)
├── database/
│   └── schema/      # ~20 archivos .schema.ts — uno por dominio
├── redis/           # RedisModule global (ioredis)
├── common/          # Guards, decoradores, tipos, rate-limit, abuse-detection
└── modules/         # ~55 módulos de negocio
drizzle/             # 16 migraciones SQL generadas por Drizzle Kit
```

**Patrones aplicados en todos los módulos:**
- Controladores delgados — solo reciben, validan y delegan
- Servicios con lógica de negocio y orquestación
- Repositorios solo para persistencia (Drizzle ORM)
- `organizationId` obligatorio en todas las consultas de datos de tenant
- RBAC con `@RequirePermission()` en cada endpoint protegido
- Audit log en todas las mutaciones sensibles

---

## Despliegue en producción

- `BETTER_AUTH_URL` debe ser la URL HTTPS pública del API (`https://api.aduvanta.com`)
- `CORS_ORIGIN` debe listar todos los orígenes del frontend con HTTPS
- En producción se rechaza automáticamente `CORS_ORIGIN` con `*`, `http://` o `localhost`
- El webhook de Stripe apunta a `https://api.aduvanta.com/api/stripe/webhooks`
- `COOKIE_DOMAIN` debe ser `.aduvanta.com` para compartir cookies entre subdominios

---

## Documentación adicional

- [Actualizar dependencias](./docs/updating.md)
- [NestJS](https://docs.nestjs.com/)
- [Better Auth](https://www.better-auth.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

## Licencia

Privado — `UNLICENSED`.
