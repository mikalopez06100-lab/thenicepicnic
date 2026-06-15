import { randomUUID } from "node:crypto";
import { normalizeDateOnly } from "@/lib/date-only";
import { ensureDatabaseSchema, getSql, isDatabaseEnabled } from "@/lib/db";
import type { ReservationSlot } from "@/lib/reservations";

export type GygRecordStatus = "held" | "booked" | "cancelled";

export type GygReservationRecord = {
  id: string;
  productId: string;
  status: GygRecordStatus;
  reservationDate: string;
  reservationTime: string;
  slot: ReservationSlot;
  participants: number;
  gygBookingReference: string | null;
  gygReservationReference: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  expiresAt: string;
  bookedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type GygRow = {
  id: string;
  product_id: string;
  status: string;
  reservation_date: string;
  reservation_time: string;
  slot: string;
  participants: number;
  gyg_booking_reference: string | null;
  gyg_reservation_reference: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  expires_at: string;
  booked_at: string | null;
  created_at: string;
  updated_at: string;
};

const fileHolds = new Map<string, GygReservationRecord>();

function rowToRecord(row: GygRow): GygReservationRecord {
  const date = normalizeDateOnly(row.reservation_date);

  return {
    id: row.id,
    productId: row.product_id,
    status: row.status as GygRecordStatus,
    reservationDate: date,
    reservationTime: row.reservation_time,
    slot: row.slot as ReservationSlot,
    participants: row.participants,
    gygBookingReference: row.gyg_booking_reference,
    gygReservationReference: row.gyg_reservation_reference,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    expiresAt: new Date(row.expires_at).toISOString(),
    bookedAt: row.booked_at ? new Date(row.booked_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

async function upsertRecord(record: GygReservationRecord) {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`
      INSERT INTO gyg_reservations (
        id, product_id, status, reservation_date, reservation_time, slot,
        participants, gyg_booking_reference, gyg_reservation_reference,
        customer_name, customer_email, customer_phone,
        expires_at, booked_at, created_at, updated_at
      ) VALUES (
        ${record.id},
        ${record.productId},
        ${record.status},
        ${normalizeDateOnly(record.reservationDate)},
        ${record.reservationTime},
        ${record.slot},
        ${record.participants},
        ${record.gygBookingReference},
        ${record.gygReservationReference},
        ${record.customerName},
        ${record.customerEmail},
        ${record.customerPhone},
        ${record.expiresAt},
        ${record.bookedAt},
        ${record.createdAt},
        ${record.updatedAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        participants = EXCLUDED.participants,
        gyg_booking_reference = EXCLUDED.gyg_booking_reference,
        gyg_reservation_reference = EXCLUDED.gyg_reservation_reference,
        customer_name = EXCLUDED.customer_name,
        customer_email = EXCLUDED.customer_email,
        customer_phone = EXCLUDED.customer_phone,
        expires_at = EXCLUDED.expires_at,
        booked_at = EXCLUDED.booked_at,
        updated_at = EXCLUDED.updated_at
    `;
    return;
  }
  fileHolds.set(record.id, record);
}

export async function getGygRecordById(id: string) {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM gyg_reservations WHERE id = ${id} LIMIT 1
    `) as GygRow[];
    return rows[0] ? rowToRecord(rows[0]) : null;
  }
  return fileHolds.get(id) ?? null;
}

export async function listActiveGygHolds(now = new Date()) {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM gyg_reservations
      WHERE status = 'held' AND expires_at > ${now.toISOString()}
    `) as GygRow[];
    return rows.map(rowToRecord);
  }
  return [...fileHolds.values()].filter(
    (r) => r.status === "held" && new Date(r.expiresAt) > now,
  );
}

export async function listBookedGygReservations() {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM gyg_reservations WHERE status = 'booked'
    `) as GygRow[];
    return rows.map(rowToRecord);
  }
  return [...fileHolds.values()].filter((r) => r.status === "booked");
}

export async function createGygHold(input: {
  productId: string;
  reservationDate: string;
  reservationTime: string;
  slot: ReservationSlot;
  participants: number;
  gygBookingReference?: string;
  gygReservationReference?: string;
  holdMinutes: number;
}): Promise<GygReservationRecord> {
  const now = new Date();
  const record: GygReservationRecord = {
    id: randomUUID(),
    productId: input.productId,
    status: "held",
    reservationDate: input.reservationDate,
    reservationTime: input.reservationTime,
    slot: input.slot,
    participants: input.participants,
    gygBookingReference: input.gygBookingReference ?? null,
    gygReservationReference: input.gygReservationReference ?? null,
    customerName: null,
    customerEmail: null,
    customerPhone: null,
    expiresAt: new Date(
      now.getTime() + input.holdMinutes * 60_000,
    ).toISOString(),
    bookedAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await upsertRecord(record);
  return record;
}

export async function confirmGygHold(
  id: string,
  input: {
    gygBookingReference: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  },
): Promise<GygReservationRecord | null> {
  const record = await getGygRecordById(id);
  if (!record || record.status !== "held") {
    return null;
  }
  const now = new Date();
  const updated: GygReservationRecord = {
    ...record,
    status: "booked",
    gygBookingReference: input.gygBookingReference,
    customerName: input.customerName ?? record.customerName,
    customerEmail: input.customerEmail ?? record.customerEmail,
    customerPhone: input.customerPhone ?? record.customerPhone,
    bookedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await upsertRecord(updated);
  return updated;
}

export async function cancelGygRecord(id: string) {
  const record = await getGygRecordById(id);
  if (!record) {
    return null;
  }
  const updated: GygReservationRecord = {
    ...record,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };
  await upsertRecord(updated);
  return updated;
}

export async function expireStaleGygHolds(now = new Date()) {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`
      UPDATE gyg_reservations
      SET status = 'cancelled', updated_at = ${now.toISOString()}
      WHERE status = 'held' AND expires_at <= ${now.toISOString()}
    `;
    return;
  }
  for (const [id, record] of fileHolds) {
    if (
      record.status === "held" &&
      new Date(record.expiresAt).getTime() <= now.getTime()
    ) {
      fileHolds.set(id, {
        ...record,
        status: "cancelled",
        updatedAt: now.toISOString(),
      });
    }
  }
}
