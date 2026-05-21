import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type ReservationSlot = "breakfast" | "lunch" | "aperitif";
export type ReservationPackage = "kit" | "kit_food" | "medium" | "prestige";
export type ReservationStatus = "pending" | "confirmed" | "expired" | "cancelled";

export type ReservationRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  status: ReservationStatus;
  packageType: ReservationPackage;
  reservationDate: string;
  slot: ReservationSlot;
  quantity: number;
  locale: "fr" | "en";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  stripeSessionId?: string;
};

type ReservationStore = {
  reservations: ReservationRecord[];
};

const HOLD_MINUTES = 20;
const MAX_RESERVATIONS_PER_SLOT = 3;

function getDataDir() {
  if (process.env.RESERVATIONS_DATA_DIR) {
    return process.env.RESERVATIONS_DATA_DIR;
  }
  // Vercel serverless : le filesystem sous /var/task est en lecture seule.
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "thenicepicnic-data");
  }
  return path.join(process.cwd(), ".data");
}

function getDataFile() {
  return path.join(getDataDir(), "reservations.json");
}

async function ensureStoreFile() {
  const dataDir = getDataDir();
  const dataFile = getDataFile();
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    const initial: ReservationStore = { reservations: [] };
    await writeFile(dataFile, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore(): Promise<ReservationStore> {
  await ensureStoreFile();
  const raw = await readFile(getDataFile(), "utf8");
  try {
    const parsed = JSON.parse(raw) as ReservationStore;
    return {
      reservations: Array.isArray(parsed.reservations) ? parsed.reservations : [],
    };
  } catch {
    return { reservations: [] };
  }
}

async function writeStore(store: ReservationStore) {
  await ensureStoreFile();
  await writeFile(getDataFile(), JSON.stringify(store, null, 2), "utf8");
}

function isActiveReservation(record: ReservationRecord, now: Date) {
  if (record.status === "confirmed") {
    return true;
  }
  if (record.status !== "pending") {
    return false;
  }
  return new Date(record.expiresAt).getTime() > now.getTime();
}

function expireStaleReservations(store: ReservationStore, now: Date) {
  for (const reservation of store.reservations) {
    if (
      reservation.status === "pending" &&
      new Date(reservation.expiresAt).getTime() <= now.getTime()
    ) {
      reservation.status = "expired";
      reservation.updatedAt = now.toISOString();
    }
  }
}

export async function createPendingReservation(input: {
  packageType: ReservationPackage;
  reservationDate: string;
  slot: ReservationSlot;
  quantity: number;
  locale: "fr" | "en";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<{ ok: true; reservation: ReservationRecord } | { ok: false; error: string }> {
  const now = new Date();
  const store = await readStore();
  expireStaleReservations(store, now);

  const activeCount = store.reservations.filter(
    (record) =>
      record.reservationDate === input.reservationDate &&
      record.slot === input.slot &&
      isActiveReservation(record, now),
  ).length;

  if (activeCount >= MAX_RESERVATIONS_PER_SLOT) {
    return {
      ok: false,
      error:
        input.locale === "fr"
          ? "Ce créneau est complet (3 réservations max). Choisis une autre date ou un autre créneau."
          : "This timeslot is fully booked (max 3 reservations). Please choose another date or slot.",
    };
  }

  const reservation: ReservationRecord = {
    id: randomUUID(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString(),
    status: "pending",
    packageType: input.packageType,
    reservationDate: input.reservationDate,
    slot: input.slot,
    quantity: input.quantity,
    locale: input.locale,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
  };

  store.reservations.push(reservation);
  await writeStore(store);
  return { ok: true, reservation };
}

export async function markReservationConfirmed(reservationId: string, stripeSessionId: string) {
  const now = new Date();
  const store = await readStore();
  const reservation = store.reservations.find((r) => r.id === reservationId);
  if (!reservation) {
    return;
  }
  reservation.status = "confirmed";
  reservation.updatedAt = now.toISOString();
  reservation.stripeSessionId = stripeSessionId;
  await writeStore(store);
}

export async function markReservationExpiredBySession(stripeSessionId: string) {
  const now = new Date();
  const store = await readStore();
  const reservation = store.reservations.find((r) => r.stripeSessionId === stripeSessionId);
  if (!reservation) {
    return;
  }
  reservation.status = "expired";
  reservation.updatedAt = now.toISOString();
  await writeStore(store);
}

export async function attachSessionIdToReservation(
  reservationId: string,
  stripeSessionId: string,
) {
  const now = new Date();
  const store = await readStore();
  const reservation = store.reservations.find((r) => r.id === reservationId);
  if (!reservation) {
    return;
  }
  reservation.stripeSessionId = stripeSessionId;
  reservation.updatedAt = now.toISOString();
  await writeStore(store);
}

export async function markReservationCancelled(reservationId: string) {
  const now = new Date();
  const store = await readStore();
  const reservation = store.reservations.find((r) => r.id === reservationId);
  if (!reservation) {
    return;
  }
  reservation.status = "cancelled";
  reservation.updatedAt = now.toISOString();
  await writeStore(store);
}

export async function listReservations() {
  const now = new Date();
  const store = await readStore();
  expireStaleReservations(store, now);
  await writeStore(store);

  const reservations = [...store.reservations].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const bySlotAndDate = new Map<
    string,
    { date: string; slot: ReservationSlot; count: number }
  >();
  for (const reservation of reservations) {
    if (!isActiveReservation(reservation, now)) {
      continue;
    }
    const key = `${reservation.reservationDate}::${reservation.slot}`;
    const prev = bySlotAndDate.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      bySlotAndDate.set(key, {
        date: reservation.reservationDate,
        slot: reservation.slot,
        count: 1,
      });
    }
  }

  return {
    reservations,
    slotUsage: [...bySlotAndDate.values()].sort((a, b) =>
      `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`),
    ),
  };
}
