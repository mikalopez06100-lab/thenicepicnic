import { randomUUID } from "node:crypto";
import { isDatabaseEnabled } from "@/lib/db";
import { listPlanningEntries } from "@/lib/planning";
import {
  expireStaleReservationsInStore,
  getStorageBackendLabel,
  loadAllReservations,
  saveReservation,
  updateReservationById,
  updateReservationByStripeSession,
} from "@/lib/reservations-persistence";
import {
  fetchReservationsFromStripe,
  mergeReservations,
} from "@/lib/reservations-stripe";
import {
  canBookSlot,
  countSlotUsage,
  getSlotAvailability,
  isSlotBlocked,
  MAX_RESERVATIONS_PER_SLOT,
} from "@/lib/slot-capacity";

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
  reservationTime?: string;
  slot: ReservationSlot;
  quantity: number;
  paidAt?: string;
  locale: "fr" | "en";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  stripeSessionId?: string;
};

const HOLD_MINUTES = 20;

export { MAX_RESERVATIONS_PER_SLOT, isDatabaseEnabled, getStorageBackendLabel };

function isActiveReservation(record: ReservationRecord, now: Date) {
  if (record.status === "confirmed") {
    return true;
  }
  if (record.status !== "pending") {
    return false;
  }
  return new Date(record.expiresAt).getTime() > now.getTime();
}

export async function createPendingReservation(input: {
  packageType: ReservationPackage;
  reservationDate: string;
  reservationTime?: string;
  slot: ReservationSlot;
  quantity: number;
  locale: "fr" | "en";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<{ ok: true; reservation: ReservationRecord } | { ok: false; error: string }> {
  const now = new Date();
  await expireStaleReservationsInStore(now);

  const localReservations = await loadAllReservations();

  let stripeReservations: ReservationRecord[] = [];
  try {
    stripeReservations = await fetchReservationsFromStripe(200);
  } catch (error) {
    console.error("fetchReservationsFromStripe for slot check", error);
  }

  const mergedForCapacity = mergeReservations(localReservations, stripeReservations);
  let planningEntries: Awaited<ReturnType<typeof listPlanningEntries>> = [];
  try {
    planningEntries = await listPlanningEntries();
  } catch (error) {
    console.error("listPlanningEntries for slot check", error);
  }

  const capacityCheck = canBookSlot(
    mergedForCapacity,
    planningEntries,
    input.reservationDate,
    input.slot,
    input.locale,
    now,
  );
  if (!capacityCheck.ok) {
    return { ok: false, error: capacityCheck.error };
  }

  const reservation: ReservationRecord = {
    id: randomUUID(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString(),
    status: "pending",
    packageType: input.packageType,
    reservationDate: input.reservationDate,
    reservationTime: input.reservationTime,
    slot: input.slot,
    quantity: input.quantity,
    locale: input.locale,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
  };

  await saveReservation(reservation);
  return { ok: true, reservation };
}

export async function markReservationConfirmed(
  reservationId: string,
  stripeSessionId: string,
): Promise<ReservationRecord | null> {
  const now = new Date();
  return updateReservationById(reservationId, (reservation) => {
    if (reservation.status === "confirmed") {
      return reservation;
    }
    return {
      ...reservation,
      status: "confirmed",
      updatedAt: now.toISOString(),
      paidAt: now.toISOString(),
      stripeSessionId,
    };
  });
}

export async function getReservationById(reservationId: string) {
  const reservations = await loadAllReservations();
  return reservations.find((r) => r.id === reservationId) ?? null;
}

export async function markReservationExpiredBySession(stripeSessionId: string) {
  const now = new Date();
  await updateReservationByStripeSession(stripeSessionId, (reservation) => ({
    ...reservation,
    status: "expired",
    updatedAt: now.toISOString(),
  }));
}

export async function attachSessionIdToReservation(
  reservationId: string,
  stripeSessionId: string,
) {
  const now = new Date();
  await updateReservationById(reservationId, (reservation) => ({
    ...reservation,
    stripeSessionId,
    updatedAt: now.toISOString(),
  }));
}

export async function markReservationCancelled(reservationId: string) {
  const now = new Date();
  await updateReservationById(reservationId, (reservation) => ({
    ...reservation,
    status: "cancelled",
    updatedAt: now.toISOString(),
  }));
}

export async function getMergedReservations() {
  const now = new Date();
  await expireStaleReservationsInStore(now);

  const localReservations = await loadAllReservations();

  let stripeReservations: ReservationRecord[] = [];
  try {
    stripeReservations = await fetchReservationsFromStripe(200);
  } catch {
    stripeReservations = [];
  }

  return mergeReservations(localReservations, stripeReservations);
}

export async function listReservations() {
  const now = new Date();
  await expireStaleReservationsInStore(now);

  const localReservations = await loadAllReservations();
  const storageBackend = getStorageBackendLabel();

  let stripeReservations: ReservationRecord[] = [];
  let stripeSyncError: string | null = null;
  try {
    stripeReservations = await fetchReservationsFromStripe(200);
  } catch (error) {
    console.error("fetchReservationsFromStripe", error);
    stripeSyncError =
      error instanceof Error
        ? error.message
        : "Impossible de synchroniser avec Stripe.";
  }

  const reservations = mergeReservations(localReservations, stripeReservations);

  let planningEntries: Awaited<ReturnType<typeof listPlanningEntries>> = [];
  let planningError: string | null = null;
  try {
    planningEntries = await listPlanningEntries();
  } catch (error) {
    console.error("listPlanningEntries", error);
    planningError =
      error instanceof Error
        ? error.message
        : "Impossible de charger le planning.";
  }

  const bySlotAndDate = new Map<
    string,
    {
      date: string;
      slot: ReservationSlot;
      count: number;
      blocked: boolean;
      max: number;
    }
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
      const avail = getSlotAvailability(
        reservations,
        planningEntries,
        reservation.reservationDate,
        reservation.slot,
        now,
      );
      bySlotAndDate.set(key, {
        date: reservation.reservationDate,
        slot: reservation.slot,
        count: 1,
        blocked: avail.blocked,
        max: avail.max,
      });
    }
  }

  for (const entry of planningEntries) {
    const slots: ReservationSlot[] =
      entry.slot === "day" ? ["breakfast", "lunch", "aperitif"] : [entry.slot];
    for (const slot of slots) {
      const key = `${entry.date}::${slot}`;
      const used = countSlotUsage(reservations, planningEntries, entry.date, slot, now);
      const { blocked } = isSlotBlocked(planningEntries, entry.date, slot);
      const existing = bySlotAndDate.get(key);
      if (existing) {
        existing.count = used;
        existing.blocked = blocked;
      } else if (used > 0 || blocked) {
        bySlotAndDate.set(key, {
          date: entry.date,
          slot,
          count: used,
          blocked,
          max: MAX_RESERVATIONS_PER_SLOT,
        });
      }
    }
  }

  return {
    reservations,
    planningEntries,
    slotUsage: [...bySlotAndDate.values()].sort((a, b) =>
      `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`),
    ),
    stripeSyncError,
    planningError,
    storageBackend,
    stripeCount: stripeReservations.length,
    localCount: localReservations.length,
  };
}
