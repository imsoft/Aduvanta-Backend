# Auditoría de seguridad — Backend

Auditoría realizada sobre [`aduvanta-backend`](../) (NestJS 11, Better Auth, Drizzle ORM, Redis, PostgreSQL, Stripe, S3).

**Fecha de la auditoría:** 2026-04-22
**Alcance:** código, configuración, secretos, procesos e infraestructura (Vercel + Neon + Upstash + S3 + Stripe).
**Entorno de despliegue:** Vercel (frontend y backend).

## Cómo leer este reporte

Cada hallazgo tiene:
- **ID** (`C#` crítico, `A#` alto, `M#` medio, `B#` bajo, `I#` infra/procesos).
- **Evidencia** con `archivo:línea`.
- **Riesgo**.
- **Fix propuesto**.
- **Estado**: `abierto` / `mitigado` / `aceptado`.

## Resumen ejecutivo

| Severidad | Total | Abiertos | Mitigados |
|-----------|-------|----------|-----------|
| Crítico   | 3     | 1 (C3)   | 2 (C2, C4)  |
| Alto      | 7     | 0        | 7         |
| Medio     | 9     | 1 (M11)  | 8         |
| Bajo      | 4     | 1 (B4)   | 3         |
| Infra     | 9     | 9        | 0         |

**Estado global tras la auditoría:** la mayoría de hallazgos de código fueron mitigados en las fases 1–4. Los hallazgos abiertos requieren acción humana (rotación real de secretos S1–S11 con `SYSTEM_ADMIN_EMAIL`, decisiones de plan de updates major, configuración en consolas de los proveedores).

---

## CRÍTICO

### C2 — Helmet no cubre `/api/auth/*`  — **mitigado**

- **Evidencia:** [`src/main.ts`](../src/main.ts) líneas 67–153 registraban el handler de Better Auth **antes** de `app.use(helmet(...))`.
- **Riesgo:** Respuestas de login/signup/OAuth/reset/session sin HSTS, `X-Content-Type-Options`, CSP ni `Frame-Ancestors`.
- **Fix aplicado:** `helmet(...)` y `cookieParser(...)` ahora corren antes del middleware de Better Auth. Verificado con `pnpm build` exitoso.
- **Estado:** mitigado.

### C3 — Secretos reales en `.env` local sin proceso de rotación — **abierto (requiere acción humana)**

- **Evidencia:** `.env` del backend contiene credenciales productivas.
- **Riesgo:** Sin rotación planificada, una filtración pasa inadvertida.
- **Fix aplicado:** Matriz de rotación, runbook y checklist documentados en [`security-operations.md`](./security-operations.md) sección 1. La rotación real (en Vercel + Neon + AWS + Google + Stripe + Upstash + Resend) debe hacerla el equipo humano.
- **Estado:** abierto — pendiente de ejecutar la primera rotación y llenar la matriz.

### C4 — Webhook de Stripe responde 200 aunque falle + sin deduplicación — **mitigado**

- **Evidencia anterior:** [`src/modules/stripe/stripe-webhook.controller.ts`](../src/modules/stripe/stripe-webhook.controller.ts) líneas 100–108 devolvía `200` en cualquier error.
- **Fix aplicado:**
  - Nueva tabla `stripe_processed_events` ([`drizzle/0014_stripe_processed_events.sql`](../drizzle/0014_stripe_processed_events.sql), schema en [`stripe-processed-events.schema.ts`](../src/database/schema/stripe-processed-events.schema.ts)).
  - Repository `StripeProcessedEventsRepository` con `markProcessed` idempotente (`ON CONFLICT DO NOTHING`).
  - Controlador actualizado: replay → 200 duplicate; fallo interno → 500 y `unmark` para que Stripe reintente.
- **Estado:** mitigado. La migración 0014 se debe aplicar en producción antes del despliegue.

---

## ALTO

### A1 — `FileInterceptor` sin límites ni MIME — **mitigado**

- **Fix aplicado:** nuevo helper [`src/common/uploads/file-upload.config.ts`](../src/common/uploads/file-upload.config.ts) con `MAX_UPLOAD_SIZE_BYTES = 25 MB` y allowlists (`DOCUMENT_UPLOAD_MIME_TYPES`, `CSV_UPLOAD_MIME_TYPES`). Integrado en los 3 controladores (`documents` × 2, `imports` × 1) y en `StorageService.upload`.
- **Estado:** mitigado.

### A3 — Logs sin redacción — **mitigado**

- **Fix aplicado:** `nestjs-pino` configurado con `redact` de `req.headers.authorization`, `req.headers.cookie`, `*.password`, `*.token`, `*.secret`, etc. ([`src/app.module.ts`](../src/app.module.ts)). Emails en lockout loguean un hash SHA-256 truncado a 16 chars en vez del email claro ([`src/main.ts`](../src/main.ts) `hashEmail`).
- **Estado:** mitigado.

### A4 — Sentry no inicializado — **mitigado**

- **Fix aplicado:** [`src/instrument.ts`](../src/instrument.ts) importado antes de AppModule en `main.ts`. `beforeSend` limpia cookies, auth headers y campos sensibles. GlobalExceptionFilter ahora llama a `Sentry.captureException` para errores 5xx. Frontend: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` + `instrumentation.ts`.
- **Estado:** mitigado. Producción debe configurar `SENTRY_DSN` en Vercel env.

### A5 — Sin verificación de email, reset password ni rateLimit — **mitigado**

- **Fix aplicado:** Better Auth ahora con:
  - `emailAndPassword: { minPasswordLength: 12, maxPasswordLength: 128, sendResetPassword, requireEmailVerification: EMAIL_VERIFICATION_REQUIRED }`.
  - `emailVerification: { sendOnSignUp, autoSignInAfterVerification, sendVerificationEmail }`.
  - `rateLimit: { enabled: true, window: 60, max: 100, customRules: { '/sign-in/email', '/sign-up/email', '/forget-password', '/reset-password' } }`.
  - Nuevo [`EmailModule`](../src/modules/email/email.module.ts) + [`EmailService`](../src/modules/email/email.service.ts) con Resend (fallback a log si no hay `RESEND_API_KEY`).
- **Estado:** mitigado. Para activar obligatoriedad de verificación, poner `EMAIL_VERIFICATION_REQUIRED=true` en producción.

### A6 — `trust proxy` no configurado — **mitigado**

- **Fix aplicado:** `app.set('trust proxy', 1)` en [`src/main.ts`](../src/main.ts). `extractIp` prefiere `req.ip` (normalizado por Express con trust proxy activo).
- **Estado:** mitigado.

### A7 — `HttpException` expone mensaje interno — **mitigado**

- **Fix aplicado:** [`src/common/filters/global-exception.filter.ts`](../src/common/filters/global-exception.filter.ts) reescrito: errores 4xx mantienen `message`; errores 5xx devuelven "Internal server error" + `errorId` UUID (también loggeado y enviado a Sentry con el mismo tag). Así el usuario puede citar el `errorId` a soporte sin exponer detalles internos.
- **Estado:** mitigado.

---

## MEDIO

### M1 — Pool pg sin `max` — **mitigado**

- **Fix aplicado:** [`src/database/database.module.ts`](../src/database/database.module.ts) usa `config.get('PG_POOL_MAX')` (default 20).
- **Estado:** mitigado.

### M2 — Sin `enableShutdownHooks` — **mitigado**

- **Fix aplicado:** `app.enableShutdownHooks()` en `main.ts`. `DatabaseModule` y `RedisModule` implementan `OnApplicationShutdown` para cerrar pool pg y conexión Redis (con `quit` para flush antes de `disconnect`).
- **Estado:** mitigado.

### M3 — `@nestjs/throttler` sin usar — **mitigado**

- **Fix aplicado:** removido con `pnpm remove @nestjs/throttler`. El rate-limit custom en Redis + Better Auth rateLimit cubren el caso.
- **Estado:** mitigado.

### M4 — `cookie-parser` sin secret — **mitigado**

- **Fix aplicado:** nueva variable `COOKIE_SECRET` opcional en [`config.schema.ts`](../src/config/config.schema.ts). `cookieParser(config.get('COOKIE_SECRET'))` en `main.ts`.
- **Estado:** mitigado.

### M5 — Doble pool pg al mismo DSN — **mitigado**

- **Fix aplicado:** `AuthModule` inyecta `DATABASE_POOL` en lugar de crear su propio `Pool`. Una sola conexión a Neon.
- **Estado:** mitigado.

### M7 — Email del superadmin hardcoded en seed — **mitigado**

- **Fix aplicado:** [`drizzle/seeds/system-admin-seed.sql`](../drizzle/seeds/system-admin-seed.sql) usa `:admin_email`, leído desde `SYSTEM_ADMIN_EMAIL` en el runner.
- **Estado:** mitigado.

### M8 — S3: MIME sin validar + TTL sin cap — **mitigado**

- **Fix aplicado:** [`StorageService.upload`](../src/modules/storage/storage.service.ts) valida `contentType` contra la allowlist. `getPresignedUrl` clamp de 30 s a 15 min.
- **Estado:** mitigado.

### M9 — `CORS_ORIGIN` sin validación productiva — **mitigado**

- **Fix aplicado:** `superRefine` en [`config.schema.ts`](../src/config/config.schema.ts) rechaza valores con `localhost`, `127.0.0.1`, `http://` o `*` cuando `NODE_ENV === 'production'`. También rechaza `BETTER_AUTH_URL` sin HTTPS en producción.
- **Estado:** mitigado.

### M11 — Historial git del seed con email operativo — **abierto**

- **Riesgo:** `git log -- drizzle/seeds/system-admin-seed.sql` muestra el email de superadmin en commits previos.
- **Fix sugerido:** si el repositorio es privado y el equipo es pequeño, aceptar el riesgo. Si algún día se hace público, ejecutar `git filter-repo` para reescribir la historia (requiere coordinación con todos los forks/clones).
- **Estado:** abierto — decisión de negocio.

---

## BAJO

### B2 — `.gitignore` incompleto — **mitigado**

- **Fix aplicado:** [`.gitignore`](../.gitignore) amplía con `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.crt`, `credentials*.json`, `serviceAccount*.json`, `.sentryclirc`, etc.
- **Estado:** mitigado.

### B4 — Updates major disponibles — **abierto**

- TypeScript 6, ESLint 10, Stripe 22 (backend usa 20), `better-call` 2 (aviso de peer dependency), `@better-auth/infra` 0.2.
- **Fix:** Planear en próximo ciclo documentado en [`docs/updating.md`](./updating.md). No urgente.
- **Estado:** abierto.

### B5 — Dependencia `resend` instalada sin usar — **mitigado**

- **Fix aplicado:** ahora se usa en [`EmailService`](../src/modules/email/email.service.ts) para `sendResetPassword` y `sendVerification` de Better Auth.
- **Estado:** mitigado.

---

## INFRA / PROCESOS — **pendiente de ejecución humana**

Todos los hallazgos de la sección Infra (I1–I9) siguen abiertos porque son acciones humanas en consolas externas. La guía operativa, matriz de rotación, runbooks de incidentes, checklists por proveedor y plantillas de cumplimiento viven en [`security-operations.md`](./security-operations.md). CI de secret-scanning (gitleaks) + `pnpm audit --prod` ya aplicados en [`.github/workflows/security-audit.yml`](../.github/workflows/security-audit.yml).

---

## Próximas acciones

- [ ] Ejecutar migración `0014_stripe_processed_events.sql` en Neon (producción + staging).
- [ ] Setear `EMAIL_VERIFICATION_REQUIRED=true` tras validar el flujo de verificación.
- [ ] Primera pasada de rotación según matriz en [`security-operations.md`](./security-operations.md) §1.
- [ ] Checklists Vercel/Neon/Redis/S3/Stripe/Google/Resend/Sentry (ver [`security-operations.md`](./security-operations.md) §3–§5).
- [ ] Publicar el aviso de privacidad en el frontend siguiendo [`security-operations.md`](./security-operations.md) §6.1.
- [ ] Activar secret scanning en GitHub (Settings → Security) además de gitleaks en CI.
- [ ] Configurar Dependabot / Renovate para automatizar updates.
- [ ] (Opcional) Migrar la CSP del frontend de `'unsafe-inline'` a nonces generados en el proxy/middleware.

## Referencias externas

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP ASVS 4.0](https://owasp.org/www-project-application-security-verification-standard/)
- [LFPDPPP (México)](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf)
- [Better Auth security docs](https://www.better-auth.com/docs/concepts/rate-limit)
- [Neon security best practices](https://neon.tech/docs/manage/security)
