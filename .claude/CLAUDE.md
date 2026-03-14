# CLAUDE.md

## Backend Project Overview

This repository contains the backend application for Aduvanta.

Aduvanta is an enterprise-grade customs and foreign trade operations platform.
The backend must be built as a serious multi-tenant business platform from the beginning.

The backend is responsible for:

- authentication integration
- organization-aware access control
- role-based authorization
- auditability
- domain integrity
- reliable persistence
- secure APIs
- long-term maintainability

This is not a prototype backend.
This backend must be built as a scalable modular platform.

The current priority is the foundation layer:

- config
- database
- auth
- users
- organizations
- memberships
- roles
- permissions
- audit logs

Do not prioritize operations, documents, finance, compliance, integrations, or AI before the foundation is working correctly.

---

## Official Backend Stack

- NestJS
- TypeScript
- Drizzle ORM
- PostgreSQL on Neon
- Better Auth
- Redis
- S3-compatible object storage
- Sentry
- OpenTelemetry
- Pino for structured logging

Optional later-stage additions:

- Temporal for durable workflows
- additional search/indexing infrastructure when justified

---

## Global Rules

### Code Style

- Comments in English only
- Prefer functional programming over OOP
- Use OOP classes only where required by NestJS, framework integration, connectors, or external system interfaces
- Write pure functions whenever possible
- Follow DRY, KISS, and YAGNI principles
- Use strict typing everywhere
- Check if logic already exists before writing new code
- Avoid untyped variables and generic types
- Never use default parameter values
- Create proper type definitions for complex data structures
- All imports at the top of the file
- Write simple single-purpose functions
- Avoid multi-mode behavior and flag parameters that switch logic

### Error Handling

- Always raise errors explicitly, never silently ignore them
- Use specific error types that clearly indicate what went wrong
- Avoid catch-all handlers that hide root causes
- Error messages must be clear and actionable
- No fallbacks unless explicitly requested
- Fix root causes, not symptoms
- External service calls must use retries with warnings, then raise the last error
- Error messages must include enough context to debug: request params, response body, status codes
- Logging must use structured fields instead of interpolated dynamic strings

### Libraries and Dependencies

- Install dependencies in the project environment, not globally
- Add dependencies to project config files
- Do not introduce new dependencies without a clear reason
- If a dependency is already installed, inspect real usage before adding alternatives

### Claude Code Workflow

- Read the existing code and relevant `CLAUDE.md` files before editing
- Keep changes minimal and related to the current request
- Match the existing repository style
- Do not revert unrelated changes
- If unsure, inspect the codebase instead of inventing patterns
- Run lint and relevant tests if the task changed code

### Documentation

- Code is the primary documentation
- Use clear naming, types, and docstrings
- Keep documentation close to the code it describes
- Avoid duplicating documentation across files
- Store knowledge as current state, not as a changelog

---

## Backend Architecture Rules

### General Architecture

- Build the backend as a modular monolith with clear domain boundaries
- Organize modules by business domain, not by technical layer only
- Keep module responsibilities narrow and explicit
- Design for future extraction of services, but do not split into microservices prematurely
- Prefer one clear application architecture over multiple competing patterns

### Module Boundaries

Each module should own its:

- controller
- service
- repository
- dto
- domain types
- internal business rules

Do not spread business logic across unrelated modules.

### Thin Controllers

Controllers should only:

- receive HTTP requests
- validate incoming shape
- call application services
- return response models

Controllers must not contain business rules.

### Services

Services should contain:

- application use-case orchestration
- domain validation
- business flow decisions
- authorization-aware business execution where appropriate

Services must not become dumping grounds for unrelated logic.

### Repositories

Repositories are responsible for persistence only.

Repositories should:

- query the database
- persist entities
- map records to typed outputs

Repositories must not contain business decisions, permission logic, or workflow orchestration.

---

## Multi-Tenancy Rules

- The platform is multi-tenant from day one
- Every tenant-scoped entity must include `organizationId`
- Access to organization data must always be explicit and validated
- Never assume a user belongs to only one organization
- Users may belong to multiple organizations through memberships
- Membership is the canonical link between a user and an organization
- Role assignment is organization-scoped unless explicitly defined as system-wide

### Tenant Safety

- Never query tenant-scoped data without organization context
- Never trust organization identifiers from the client without validation
- Every read and write path must enforce tenant boundaries
- Missing tenant context must fail explicitly

---

## Authorization Rules

### General Authorization

- RBAC is mandatory from the beginning
- Permissions must be explicit, not inferred
- Backend authorization is the source of truth
- Never rely on frontend visibility for access control
- Avoid hardcoding role names across scattered business logic
- Centralize permission codes and permission evaluation

### Role and Permission Model

Roles represent permission bundles.
Permissions represent resource actions.

Preferred permission shape:

- `resource.action`

Examples:

- `organizations.read`
- `users.invite`
- `roles.assign`

### Enforcement

- Protected actions must check permissions explicitly
- Authorization checks must happen before sensitive domain mutations
- Resource ownership and tenant scope must be validated separately from permission possession

---

## Auditability Rules

- Sensitive mutations must create audit logs
- Audit logs must include:
  - organization id
  - actor user id
  - action
  - resource
  - resource id
  - metadata
  - request context when available

- Audit log metadata must be structured
- Audit log writes must not be silently skipped
- Audit log records are append-only from the application perspective

Examples of actions that must be audited:

- organization creation
- membership changes
- role assignment
- permission updates
- user invitation
- destructive mutations
- security-relevant configuration changes

---
