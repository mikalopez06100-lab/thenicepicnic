import { getMergedReservations } from "@/lib/reservations";
import { listPlanningEntries } from "@/lib/planning";
import {
  canBookSlot,
  getSlotAvailability,
  MAX_RESERVATIONS_PER_SLOT,
} from "@/lib/slot-capacity";
import { listActiveGygHolds, expireStaleGygHolds } from "@/lib/gyg/store";
import type { ReservationSlot } from "@/lib/reservations";

/** Les holds GYG actifs comptent comme une réservation dans le créneau. */
export async function countGygHoldsForSlot(
  date: string,
  slot: ReservationSlot,
  now = new Date(),
) {
  await expireStaleGygHolds(now);
  const holds = await listActiveGygHolds(now);
  return holds.filter(
    (h) => h.reservationDate === date && h.slot === slot,
  ).length;
}

export async function getCapacityContext(now = new Date()) {
  const [reservations, planningEntries, gygHolds] = await Promise.all([
    getMergedReservations(),
    listPlanningEntries(),
    listActiveGygHolds(now),
  ]);

  return { reservations, planningEntries, gygHolds, now };
}

export async function getVacanciesForSlot(
  date: string,
  slot: ReservationSlot,
  now = new Date(),
) {
  const ctx = await getCapacityContext(now);
  const base = getSlotAvailability(
    ctx.reservations,
    ctx.planningEntries,
    date,
    slot,
    now,
  );

  const gygUsed = ctx.gygHolds.filter(
    (h) => h.reservationDate === date && h.slot === slot,
  ).length;

  const used = base.used + gygUsed;
  const available = base.blocked
    ? 0
    : Math.max(0, MAX_RESERVATIONS_PER_SLOT - used);

  return {
    ...base,
    used,
    available,
    gygUsed,
  };
}

export async function canAcceptGygBooking(
  date: string,
  slot: ReservationSlot,
  now = new Date(),
) {
  const ctx = await getCapacityContext(now);
  const gygUsed = ctx.gygHolds.filter(
    (h) => h.reservationDate === date && h.slot === slot,
  ).length;

  if (gygUsed > 0) {
    const vacancies = await getVacanciesForSlot(date, slot, now);
    if (vacancies.available <= 0 || vacancies.blocked) {
      return { ok: false as const, reason: "NO_AVAILABILITY" as const };
    }
    return { ok: true as const };
  }

  const check = canBookSlot(
    ctx.reservations,
    ctx.planningEntries,
    date,
    slot,
    "fr",
    now,
  );
  if (!check.ok) {
    return { ok: false as const, reason: "NO_AVAILABILITY" as const };
  }
  return { ok: true as const };
}
