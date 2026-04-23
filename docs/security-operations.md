# Operaciones de seguridad

Guía operativa para mantener el sistema seguro: rotación de secretos, runbooks
de incidentes, checklists de infraestructura (Vercel, Neon, Redis, S3, Stripe)
y plantillas de cumplimiento (LFPDPPP México / GDPR UE).

## 1. Inventario y rotación de secretos

### 1.1 Matriz de secretos

| ID | Nombre | Dónde vive | Impacto si se filtra | Cadencia | Responsable | Última rotación |
|----|--------|------------|----------------------|----------|-------------|-----------------|
| S1 | `DATABASE_URL` (Neon) | Vercel env + `.env` local | Acceso total a base de datos | 180 días | Backend lead | — |
| S2 | `REDIS_URL` (Upstash) | Vercel env + `.env` local | Lectura/escritura de sesiones y rate-limits | 180 días | Backend lead | — |
| S3 | `BETTER_AUTH_API_KEY` | Vercel env + `.env` local | Forgar cookies de sesión de cualquier usuario | 90 días | Backend lead | — |
| S4 | `ENCRYPTION_KEY` (integrations) | Vercel env + `.env` local | Descifrado de integraciones (`integrations.secretEncrypted`) | 365 días (con re-cifrado) | Backend lead | — |
| S5 | `GOOGLE_CLIENT_SECRET` | Vercel env + Google Cloud Console | Suplantación del flujo OAuth de Google | 365 días | Backend lead | — |
| S6 | `STRIPE_SECRET_KEY` | Vercel env + Stripe Dashboard | Operar sobre la cuenta Stripe (crear refunds, payouts) | 180 días (o al menor incidente) | Billing lead | — |
| S7 | `STRIPE_WEBHOOK_SECRET` | Vercel env + Stripe Dashboard | Firmar webhooks falsos | 180 días | Billing lead | — |
| S8 | `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` | Vercel env + IAM | Lectura/escritura/borrado de objetos S3 | 90 días | Backend lead | — |
| S9 | `RESEND_API_KEY` | Vercel env | Enviar emails suplantando al dominio | 180 días | Backend lead | — |
| S10 | `SENTRY_DSN` | Vercel env | Flooding del proyecto Sentry (bajo riesgo) | 365 días | Backend lead | — |
| S11 | `COOKIE_SECRET` (opcional) | Vercel env | Forgar signed cookies | 180 días | Backend lead | — |

Llenar la columna “Última rotación” tras cada rotación y archivar la evidencia
en el repositorio interno de documentación operativa (no en este repo
público).

### 1.2 Procedimiento general de rotación

1. **Pre-condición:** identificar todos los consumidores del secreto (backend, workers, CI, scripts locales).
2. Si el proveedor lo permite (Stripe, AWS, Google), **crear la nueva clave sin revocar la anterior** (overlap window).
3. Actualizar la variable en Vercel (ambos environments: `production` y `preview`).
4. Redeploy del backend (`vercel --prod`).
5. Smoke test en producción (endpoints críticos: login, webhook Stripe de prueba, upload a S3).
6. Revocar la clave anterior en el proveedor.
7. Borrar la clave anterior de la máquina local (`.env`) y actualizar la bóveda compartida.
8. Registrar la rotación en la matriz.

### 1.3 Rotación de `ENCRYPTION_KEY` (caso especial)

`ENCRYPTION_KEY` se usa para cifrar la columna `integrations.secretEncrypted`.
Rotar sin re-cifrar **corrompe** todas las integraciones existentes.

Flujo recomendado:

1. Generar la nueva clave: `openssl rand -hex 32`.
2. Deployar el backend con **dos claves** temporales:
   - `ENCRYPTION_KEY` = nueva
   - `ENCRYPTION_KEY_OLD` = anterior
   - Código de cifrado: siempre escribe con la nueva; al leer, si falla con la nueva, reintenta con la anterior.
3. Script de migración (`pnpm tsx scripts/rotate-encryption-key.ts`):
   - Itera todas las filas con `secretEncrypted`.
   - Descifra con la vieja.
   - Re-cifra con la nueva.
   - Escribe en transacción.
4. Verificar un 100% de cobertura (no queda ninguna integración cifrada con la vieja).
5. Remover `ENCRYPTION_KEY_OLD` y el fallback en código.
6. Redeploy.

> **No existe hoy `ENCRYPTION_KEY_OLD` en el schema.** Si la primera rotación es urgente, crear el PR del fallback antes de rotar.

### 1.4 Bóveda compartida

- No usar chat (Slack, WhatsApp) ni email para compartir secretos.
- Usar gestor de contraseñas del equipo (1Password, Bitwarden) con carpeta compartida "Aduvanta / infra".
- Acceso restringido a personas activas en payroll (`access_review` trimestral).

## 2. Respuesta a incidentes

### 2.1 Severidad

| Nivel | Criterio | SLA respuesta | Escalamiento |
|-------|----------|---------------|--------------|
| SEV-1 | Exposición de PII de clientes, sesión comprometida masiva, ransom | Inmediata | CEO + legal + todos los leads |
| SEV-2 | Credenciales de un proveedor filtradas; downtime parcial de producción | < 2h | Backend lead + CEO |
| SEV-3 | Bug de seguridad en preview; vulnerabilidad interna | < 1 día | Backend lead |

### 2.2 Playbook SEV-1 / SEV-2

1. **Contención.**
   - Revocar el secreto comprometido en el proveedor.
   - Si es cookie/sesión: rotar `BETTER_AUTH_API_KEY` (invalida todas las sesiones).
   - Si es S3: revocar la credencial IAM, crear otra, rotar en Vercel.
   - Si es DB: cambiar password de Neon, rotar `DATABASE_URL`.
2. **Erradicación.**
   - Analizar logs (pino + Sentry) del intervalo de exposición.
   - Revocar sesiones activas (`DELETE FROM session` si aplica).
3. **Recuperación.**
   - Verificar en producción: login, webhook Stripe, upload a S3.
   - Monitorear Sentry 24h siguientes.
4. **Notificación LFPDPPP.**
   - Si hay afectación a titulares de datos personales, notificar en ≤ 72 h (ver sección 6).
5. **Post-mortem.**
   - Documento en `docs/incidents/YYYY-MM-DD-<slug>.md` con timeline, causa raíz, acciones.

## 3. Checklist Vercel

### 3.1 Producción (backend + frontend)

- [ ] Variables de entorno definidas en **Production** y **Preview** por separado.
- [ ] **Deployment Protection** activado (password o SSO) en previews; un preview con DB de producción NO debe ser accesible sin autenticación.
- [ ] **Vercel Firewall** con reglas:
  - Rate limit `/api/auth/*`: 10 req / min por IP.
  - Rate limit `/api/stripe/webhooks`: bypass (Stripe necesita alta disponibilidad).
  - Bloqueo geo opcional (si el negocio está 100% en México/EEUU).
  - Attack Challenge Mode en condiciones de ataque activo.
- [ ] **Log Drain** configurado hacia Sentry o Datadog.
- [ ] **Secret Redaction** activado (Vercel lo hace por defecto en logs, verificar).
- [ ] Dominio custom con **HTTPS forzado**; HSTS preload enviado (verificado en hstspreload.org).
- [ ] `NODE_ENV=production` en env.
- [ ] `ignoreBuildStep` no configurado a la ligera (evita deploys accidentales).
- [ ] Equipo con **2FA** obligatorio en Vercel; invitar solo cuentas con 2FA activo.

### 3.2 Revisar tras cada rotación de miembro del equipo

- [ ] Remover el miembro del team en Vercel.
- [ ] Remover de Google Cloud, Stripe, AWS, Neon, Upstash, Sentry, Resend.
- [ ] Rotar cualquier secreto que haya podido ver (bóveda compartida, variables de entorno).

## 4. Checklist Neon (Postgres)

- [ ] Plan paid (free no tiene SLA de soporte ni PITR completo).
- [ ] **Point-in-Time Recovery** habilitado (retención mínima 7 días, ideal 30).
- [ ] **IP Allowlist** (si el plan lo permite): restringir a IPs de Vercel + oficina.
- [ ] `sslmode=require` en `DATABASE_URL` (verificar en el string).
- [ ] **Branching** para migraciones destructivas: siempre testear en una rama antes de `main`.
- [ ] Backups adicionales: snapshot semanal exportado a S3 privado.
- [ ] Roles DB separados: `app` (lectura + escritura en tablas de negocio) vs `migrator` (DDL). Actualmente todo usa el rol principal — planear separación.
- [ ] Logs de conexión revisados mensualmente en busca de IPs desconocidas.

## 5. Checklists por proveedor

### 5.1 Upstash Redis

- [ ] Conexión TLS (`rediss://`) en producción.
- [ ] ACL específica: usuario `aduvanta-app` con permisos `+@all -@dangerous` (sin `FLUSHDB`, `CONFIG`).
- [ ] MFA en la cuenta Upstash.
- [ ] Facturación con alertas (detecta spikes sospechosos).

### 5.2 AWS S3

- [ ] **Block Public Access** activado a nivel cuenta Y bucket.
- [ ] **Versioning** habilitado (recuperación ante borrados accidentales o ransomware).
- [ ] **Lifecycle** configurado para eliminar versiones no-current > 90 días.
- [ ] Bucket policy restrictiva (no `Principal: "*"`); solo el IAM user de la app.
- [ ] IAM user con permisos mínimos: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` **solo** en `arn:aws:s3:::<bucket>/*`.
- [ ] Sin permisos `s3:*`, sin `iam:*`, sin `PassRole`.
- [ ] **CloudTrail** activado para auditar accesos.
- [ ] **Encryption at rest** (SSE-S3 o SSE-KMS) verificado en bucket settings.
- [ ] CORS de bucket configurado solo para el dominio de producción.

### 5.3 Stripe

- [ ] Webhook endpoint en HTTPS del dominio productivo (`https://api.aduvanta.com/api/stripe/webhooks`).
- [ ] `whsec_` rotado tras cualquier sospecha.
- [ ] Solo los eventos necesarios suscritos (`checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`).
- [ ] Usuarios del dashboard con **2FA**.
- [ ] API keys: solo **Restricted Keys** cuando sea posible (no Secret Key ilimitada).
- [ ] Radar configurado (fraud detection).

### 5.4 Google OAuth

- [ ] Consent screen con dominio verificado.
- [ ] Authorized redirect URIs solo incluyen el dominio productivo + `localhost:3000` en dev.
- [ ] Publishing status: `In production` (no `Testing` si tiene > 100 usuarios).
- [ ] Sensitive scopes justificados (idealmente solo `email`, `profile`).

### 5.5 Resend

- [ ] Dominio verificado con SPF + DKIM + DMARC (reject o quarantine).
- [ ] API keys **domain-scoped**; nunca usar master key.
- [ ] Alertas de bounce/complaint rate > 5%.

### 5.6 Sentry

- [ ] **Data Scrubbing** activado globalmente (además del `beforeSend` del código).
- [ ] Proyectos separados para backend y frontend.
- [ ] Retención según plan (mínimo 30 días).
- [ ] Integración con Slack/email para alertas SEV-1.

## 6. Cumplimiento (LFPDPPP México / GDPR UE)

### 6.1 Aviso de privacidad (obligatorio LFPDPPP)

Publicar en `/privacidad` del frontend. Debe incluir:

1. Identidad y domicilio del responsable (Aduvanta).
2. Datos personales recabados (nombre, email, teléfono, datos de facturación, datos de operaciones aduanales de clientes).
3. Finalidad del tratamiento (primarias: prestación del servicio; secundarias: analytics, marketing).
4. Transferencias a terceros encargados (ver sección 6.3).
5. Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) y procedimiento para ejercerlos: email de contacto + plazo de respuesta ≤ 20 días hábiles.
6. Mecanismo de revocación del consentimiento.
7. Canal para cambios al aviso.

Plantilla base: ver `aduvanta-frontend/src/app/[locale]/privacidad/page.tsx`.

### 6.2 Flujo ARCO

| Solicitud | Acción operativa |
|-----------|------------------|
| Acceso | Exportar JSON con todos los datos del usuario (tablas `user`, `account`, `operations` filtrado por user_id). |
| Rectificación | El usuario tiene UI en `/dashboard/settings`. Si pide por email, cambio manual por admin. |
| Cancelación | Soft-delete del user + anonimización de operaciones históricas donde no se puedan borrar por obligación fiscal. |
| Oposición | Respetar opt-out de comunicaciones no-transaccionales. |

### 6.3 Registro de encargados de tratamiento

Documento interno (no en este repo). Debe listar para cada tercero:

| Encargado | Qué datos procesa | Ubicación servidor | Contrato DPA |
|-----------|-------------------|--------------------|--------------|
| Neon | Base de datos completa | us-east / eu-central | Sí |
| Vercel | Logs, builds | us-east / global | Sí |
| Upstash | Sesiones, rate-limits | us-east / global | Sí |
| Stripe | Pagos, facturación | EEUU | Sí |
| Resend | Emails transaccionales | EEUU | Sí |
| AWS (S3) | Documentos subidos | us-east-1 | Sí |
| Google (OAuth) | Email, perfil | EEUU | Sí |
| Sentry | Stack traces, IP (si DSN público) | EEUU | Sí |

### 6.4 Plan de respuesta a brechas

Obligaciones:

- **LFPDPPP**: notificar a titulares afectados "de manera inmediata" (INAI sugiere ≤ 72 h) y publicar comunicado si la brecha es masiva.
- **GDPR** (si hay usuarios UE): notificar a la autoridad de control en ≤ 72 h + a titulares si hay alto riesgo.

Plantilla de notificación a titulares en `docs/templates/breach-notification.md` (pendiente de crear).

## 7. CI/CD seguro

Workflows obligatorios en cada repo:

- **gitleaks**: escanear cada PR en busca de secretos.
- **pnpm audit --prod**: bloquear PRs con vulns `high`/`critical`.
- **Dependabot / Renovate**: PRs automáticos semanales.
- **CodeQL** (GitHub Security): análisis estático.

Ver `.github/workflows/security.yml` en cada repo.

## 8. Revisiones periódicas

| Tarea | Cadencia | Responsable |
|-------|----------|-------------|
| Access review (Vercel, Neon, AWS, Stripe, Sentry, Resend, Upstash, Google) | Trimestral | Backend lead |
| Rotación de secretos según matriz (sección 1.1) | Ver matriz | Backend lead |
| Revisión de logs de login sospechosos | Mensual | Backend lead |
| Revisión de la auditoría `docs/security-audit.md` (estado de hallazgos) | Trimestral | Backend lead |
| Simulacro de respuesta a incidente | Anual | Todos los leads |
| Tabletop de brecha de datos | Anual | Todos los leads + legal |
| Revisión de dependencias (`pnpm audit`, `pnpm outdated`) | Mensual | Backend lead |
| Backup restore test (Neon PITR) | Semestral | Backend lead |
