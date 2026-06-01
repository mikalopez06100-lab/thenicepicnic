import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | null = null;

export function getDatabaseUrl() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
}

export function isDatabaseEnabled() {
  return Boolean(getDatabaseUrl());
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "POSTGRES_URL (ou DATABASE_URL) manquant. Ajoute une base Vercel Postgres / Neon.",
    );
  }
  return neon(url);
}

export async function ensureDatabaseSchema() {
  if (!isDatabaseEnabled()) {
    return;
  }
  if (!schemaReady) {
    schemaReady = runMigrations();
  }
  await schemaReady;
}

async function runMigrations() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL,
      package_type TEXT NOT NULL,
      reservation_date DATE NOT NULL,
      reservation_time TEXT,
      slot TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      paid_at TIMESTAMPTZ,
      locale TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      stripe_session_id TEXT
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_reservations_date_slot
    ON reservations (reservation_date, slot)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_reservations_stripe_session
    ON reservations (stripe_session_id)
    WHERE stripe_session_id IS NOT NULL
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS planning_entries (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      entry_date DATE NOT NULL,
      slot TEXT NOT NULL,
      source TEXT NOT NULL,
      label TEXT,
      note TEXT,
      seats INTEGER,
      created_at TIMESTAMPTZ NOT NULL,
      cancelled_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_planning_entry_date
    ON planning_entries (entry_date)
  `;
}
