export async function cleanupExpiredRefreshTokens(
  db: D1Database,
  revokedRetentionDays = 7,
): Promise<number> {
  const now = Date.now();
  const revokedCutoff = now - revokedRetentionDays * 24 * 60 * 60 * 1000;
  const result = await db
    .prepare(
      `DELETE FROM refresh_tokens
       WHERE expires_at < ?
          OR (revoked_at IS NOT NULL AND revoked_at < ?)`,
    )
    .bind(now, revokedCutoff)
    .run();
  return result.meta.changes ?? 0;
}
