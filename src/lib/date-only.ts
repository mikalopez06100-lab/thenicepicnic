/** Normalise une valeur Postgres DATE (string ou Date) en `YYYY-MM-DD`. */
export function normalizeDateOnly(value: unknown): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid date value.");
    }
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }
  }

  throw new Error(`Invalid date-only value: ${String(value)}`);
}
