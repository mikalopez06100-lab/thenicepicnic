import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { normalizeDateOnly } from "@/lib/date-only";
import { ensureDatabaseSchema, getSql, isDatabaseEnabled } from "@/lib/db";
import type {
  ReservationPackage,
  ReservationRecord,
  ReservationSlot,
  ReservationStatus,
} from "@/lib/reservations";

type ReservationStore = {
  reservations: ReservationRecord[];
};

type ReservationRow = {
  id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  status: string;
  package_type: string;
  reservation_date: string;
  reservation_time: string | null;
  slot: string;
  quantity: number;
  paid_at: string | null;
  locale: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  stripe_session_id: string | null;
  romantic_upsell?: boolean | null;
  romantic_upsell_message?: string | null;
};

function getDataDir() {
  if (process.env.RESERVATIONS_DATA_DIR) {
    return process.env.RESERVATIONS_DATA_DIR;
  }
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "thenicepicnic-data");
  }
  return path.join(process.cwd(), ".data");
}

function getDataFile() {
  return path.join(getDataDir(), "reservations.json");
}

function rowToRecord(row: ReservationRow): ReservationRecord {
  const date = normalizeDateOnly(row.reservation_date);

  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
    status: row.status as ReservationStatus,
    packageType: row.package_type as ReservationPackage,
    reservationDate: date,
    reservationTime: row.reservation_time ?? undefined,
    slot: row.slot as ReservationSlot,
    quantity: row.quantity,
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : undefined,
    locale: row.locale === "en" ? "en" : "fr",
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    stripeSessionId: row.stripe_session_id ?? undefined,
    romanticUpsell: Boolean(row.romantic_upsell),
    romanticUpsellMessage: row.romantic_upsell_message ?? undefined,
  };
}

async function readFileStore(): Promise<ReservationStore> {
  const dataDir = getDataDir();
  const dataFile = getDataFile();
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as ReservationStore;
    return {
      reservations: Array.isArray(parsed.reservations) ? parsed.reservations : [],
    };
  } catch {
    const initial: ReservationStore = { reservations: [] };
    await writeFile(dataFile, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function writeFileStore(store: ReservationStore) {
  const dataDir = getDataDir();
  const dataFile = getDataFile();
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

async function upsertReservationDb(record: ReservationRecord) {
  await ensureDatabaseSchema();
  const sql = getSql();
  await sql`
    INSERT INTO reservations (
      id, created_at, updated_at, expires_at, status, package_type,
      reservation_date, reservation_time, slot, quantity, paid_at, locale,
      customer_name, customer_email, customer_phone, stripe_session_id,
      romantic_upsell, romantic_upsell_message
    ) VALUES (
      ${record.id},
      ${record.createdAt},
      ${record.updatedAt},
      ${record.expiresAt},
      ${record.status},
      ${record.packageType},
      ${normalizeDateOnly(record.reservationDate)},
      ${record.reservationTime ?? null},
      ${record.slot},
      ${record.quantity},
      ${record.paidAt ?? null},
      ${record.locale},
      ${record.customerName},
      ${record.customerEmail},
      ${record.customerPhone},
      ${record.stripeSessionId ?? null},
      ${record.romanticUpsell ?? false},
      ${record.romanticUpsellMessage ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      updated_at = EXCLUDED.updated_at,
      expires_at = EXCLUDED.expires_at,
      status = EXCLUDED.status,
      package_type = EXCLUDED.package_type,
      reservation_date = EXCLUDED.reservation_date,
      reservation_time = EXCLUDED.reservation_time,
      slot = EXCLUDED.slot,
      quantity = EXCLUDED.quantity,
      paid_at = EXCLUDED.paid_at,
      locale = EXCLUDED.locale,
      customer_name = EXCLUDED.customer_name,
      customer_email = EXCLUDED.customer_email,
      customer_phone = EXCLUDED.customer_phone,
      stripe_session_id = EXCLUDED.stripe_session_id,
      romantic_upsell = EXCLUDED.romantic_upsell,
      romantic_upsell_message = EXCLUDED.romantic_upsell_message
  `;
}

export async function loadAllReservations(): Promise<ReservationRecord[]> {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM reservations ORDER BY reservation_date DESC, created_at DESC
    `) as ReservationRow[];
    return rows.map(rowToRecord);
  }

  const store = await readFileStore();
  return store.reservations;
}

export async function saveReservation(record: ReservationRecord) {
  if (isDatabaseEnabled()) {
    await upsertReservationDb(record);
    return;
  }

  const store = await readFileStore();
  const index = store.reservations.findIndex((r) => r.id === record.id);
  if (index >= 0) {
    store.reservations[index] = record;
  } else {
    store.reservations.push(record);
  }
  await writeFileStore(store);
}

export async function expireStaleReservationsInStore(now: Date) {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`
      UPDATE reservations
      SET status = 'expired', updated_at = ${now.toISOString()}
      WHERE status = 'pending' AND expires_at <= ${now.toISOString()}
    `;
    return;
  }

  const store = await readFileStore();
  let changed = false;
  for (const reservation of store.reservations) {
    if (
      reservation.status === "pending" &&
      new Date(reservation.expiresAt).getTime() <= now.getTime()
    ) {
      reservation.status = "expired";
      reservation.updatedAt = now.toISOString();
      changed = true;
    }
  }
  if (changed) {
    await writeFileStore(store);
  }
}

export async function updateReservationById(
  id: string,
  updater: (record: ReservationRecord) => ReservationRecord | null,
): Promise<ReservationRecord | null> {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM reservations WHERE id = ${id} LIMIT 1
    `) as ReservationRow[];
    if (rows.length === 0) {
      return null;
    }
    const updated = updater(rowToRecord(rows[0]));
    if (!updated) {
      return null;
    }
    await upsertReservationDb(updated);
    return updated;
  }

  const store = await readFileStore();
  const index = store.reservations.findIndex((r) => r.id === id);
  if (index < 0) {
    return null;
  }
  const updated = updater(store.reservations[index]);
  if (!updated) {
    return null;
  }
  store.reservations[index] = updated;
  await writeFileStore(store);
  return updated;
}

export async function updateReservationByStripeSession(
  stripeSessionId: string,
  updater: (record: ReservationRecord) => ReservationRecord | null,
): Promise<ReservationRecord | null> {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM reservations WHERE stripe_session_id = ${stripeSessionId} LIMIT 1
    `) as ReservationRow[];
    if (rows.length === 0) {
      return null;
    }
    const updated = updater(rowToRecord(rows[0]));
    if (!updated) {
      return null;
    }
    await upsertReservationDb(updated);
    return updated;
  }

  const store = await readFileStore();
  const index = store.reservations.findIndex(
    (r) => r.stripeSessionId === stripeSessionId,
  );
  if (index < 0) {
    return null;
  }
  const updated = updater(store.reservations[index]);
  if (!updated) {
    return null;
  }
  store.reservations[index] = updated;
  await writeFileStore(store);
  return updated;
}

export function getStorageBackendLabel() {
  return isDatabaseEnabled() ? "postgres" : "file";
}
