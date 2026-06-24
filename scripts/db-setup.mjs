/**
 * Crée les tables Postgres (réservations + planning).
 * Usage : POSTGRES_URL="postgresql://..." node scripts/db-setup.mjs
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Définis POSTGRES_URL ou DATABASE_URL.");
  process.exit(1);
}

const sql = neon(url);

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
  stripe_session_id TEXT,
  romantic_upsell BOOLEAN NOT NULL DEFAULT FALSE,
  romantic_upsell_message TEXT
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_reservations_date_slot
  ON reservations (reservation_date, slot)
`;

await sql`
  ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS romantic_upsell BOOLEAN NOT NULL DEFAULT FALSE
`;

await sql`
  ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS romantic_upsell_message TEXT
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

await sql`
  CREATE TABLE IF NOT EXISTS gyg_reservations (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    status TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TEXT NOT NULL,
    slot TEXT NOT NULL,
    participants INTEGER NOT NULL,
    gyg_booking_reference TEXT,
    gyg_reservation_reference TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    booked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_gyg_reservations_date_slot
  ON gyg_reservations (reservation_date, slot)
`;

console.log("Tables créées ou déjà présentes.");
