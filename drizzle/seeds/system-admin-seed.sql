-- Seed system admin: aduvanta@gmail.com
-- This user gets platform-wide super admin access.
INSERT INTO system_admins (id, user_id)
SELECT gen_random_uuid(), u.id
FROM "user" u
WHERE u.email = 'aduvanta@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
