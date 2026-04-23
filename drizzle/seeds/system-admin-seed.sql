-- Seed system admin.
--
-- La identidad del superadmin NO va hardcoded en el repo. Se lee desde la
-- variable de entorno `SYSTEM_ADMIN_EMAIL` en el runner (por ejemplo en un
-- script Node o psql con `\set`). Dejamos este archivo como plantilla.
--
-- Ejemplo de uso manual con psql:
--   SYSTEM_ADMIN_EMAIL="tu-admin@example.com"
--   psql "$DATABASE_URL" -v admin_email="'$SYSTEM_ADMIN_EMAIL'" -f drizzle/seeds/system-admin-seed.sql
--
-- Si prefieres un runner programático, reemplaza :admin_email por un
-- parámetro preparado para evitar SQL injection.

INSERT INTO system_admins (id, user_id)
SELECT gen_random_uuid(), u.id
FROM "user" u
WHERE u.email = :admin_email
ON CONFLICT (user_id) DO NOTHING;
