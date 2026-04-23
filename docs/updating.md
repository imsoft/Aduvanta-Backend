# Guía para actualizar el backend (NestJS)

Este documento describe cómo mantener actualizadas las dependencias del backend de Aduvanta (NestJS + `pnpm`).

## 1. Ver qué hay desactualizado

Revisa el estado actual sin modificar nada:

```bash
pnpm outdated
```

Te muestra una tabla con:
- **Current**: la versión instalada.
- **Wanted**: la última versión compatible con el rango definido en `package.json`.
- **Latest**: la última disponible (puede ser una major distinta).

## 2. Actualización segura (respeta rangos semver)

```bash
pnpm update
```

Sube las dependencias a la última versión compatible con los rangos definidos en `package.json` (por ejemplo `^11.0.1` no pasará a `12.x`). Es la opción recomendada para mantenimiento rutinario.

Variantes útiles:

```bash
pnpm update --latest         # sube a la última absoluta (puede romper)
pnpm update --interactive    # menú interactivo para elegir qué actualizar
pnpm update @nestjs/core     # solo una dependencia específica
pnpm update "@nestjs/*"      # todo el scope de NestJS
```

## 3. Actualizar NestJS con su CLI oficial

NestJS trae un comando que actualiza todos los paquetes `@nestjs/*` de forma coherente:

```bash
pnpm dlx @nestjs/cli update              # última versión compatible
pnpm dlx @nestjs/cli update --force      # fuerza la última major (puede romper)
pnpm dlx @nestjs/cli update --tag next   # canal "next"
```

Úsalo cuando quieras saltar de `@nestjs/*` 10 → 11, etc. Así evitas dejar paquetes del framework en versiones inconsistentes.

## 4. Flujo recomendado paso a paso

```bash
# 1. Rama aparte por seguridad
git checkout -b chore/update-deps

# 2. Revisa qué está atrasado
pnpm outdated

# 3. Actualizaciones menores/patch
pnpm update

# 4. Paquetes del framework
pnpm dlx @nestjs/cli update

# 5. Asegura el lockfile
pnpm install

# 6. Verifica que compila
pnpm run build

# 7. Corre tests
pnpm test

# 8. Prueba en local
pnpm start:dev
```

## 5. Volver atrás si algo falla

```bash
git restore package.json pnpm-lock.yaml
pnpm install
```

## 6. Buenas prácticas

- Actualiza en una rama dedicada (`chore/update-deps`) y abre un PR.
- Revisa los *changelogs* de `@nestjs/*`, `drizzle-orm`, `better-auth`, `stripe` y `@sentry/*` antes de una actualización major.
- Corre siempre `pnpm run build` y `pnpm test` antes de mergear.
- Si cambian variables de entorno o contratos de API, documéntalo en el PR.
