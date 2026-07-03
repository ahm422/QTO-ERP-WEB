export function isSqliteUniqueConstraintError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("unique constraint failed") ||
    message.includes("sqlite_constraint_unique")
  );
}
