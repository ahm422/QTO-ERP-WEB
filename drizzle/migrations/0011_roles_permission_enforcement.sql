-- Backfill legacy single-role ADMIN users to SUPER_ADMIN (no lockout after multi-role rollout).
-- Schema default for new rows remains ADMIN (middle tier); bootstrap scripts insert SUPER_ADMIN.
UPDATE users SET role = 'SUPER_ADMIN' WHERE role = 'ADMIN';
