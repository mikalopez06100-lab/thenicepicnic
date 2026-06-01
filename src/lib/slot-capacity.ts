import type { PlanningEntry } from "@/lib/planning-types";
import type { ReservationRecord, ReservationSlot } from "@/lib/reservations";

export const MAX_RESERVATIONS_PER_SLOT = 3;

export const ALL_SLOTS: ReservationSlot[] = ["breakfast", "lunch", "aperitif"];

export type SlotAvailability = {
  date: string;
  slot: ReservationSlot;
  used: number;
  max: number;
  available: number;
  blocked: boolean;
  blockReason?: string;
};

function isActiveReservation(record: ReservationRecord, now: Date) {
  if (record.status === "confirmed") {
    return true;
  }
  if (record.status !== "pending") {
    return false;
  }
  return new Date(record.expiresAt).getTime() > now.getTime();
}

function entriesForDateSlot(
  entries: PlanningEntry[],
  date: string,
  slot: ReservationSlot,
) {
  return entries.filter(
    (e) =>
      e.date === date &&
      (e.slot === slot || e.slot === "day") &&
      !e.cancelledAt,
  );
}

export function isSlotBlocked(
  entries: PlanningEntry[],
  date: string,
  slot: ReservationSlot,
): { blocked: boolean; reason?: string } {
  const matches = entriesForDateSlot(entries, date, slot);
  const block = matches.find((e) => e.kind === "block");
  if (block) {
    return { blocked: true, reason: block.label || block.note || "Créneau bloqué" };
  }
  return { blocked: false };
}

export function countSlotUsage(
  reservations: ReservationRecord[],
  entries: PlanningEntry[],
  date: string,
  slot: ReservationSlot,
  now = new Date(),
): number {
  let used = reservations.filter(
    (r) =>
      r.reservationDate === date &&
      r.slot === slot &&
      isActiveReservation(r, now),
  ).length;

  for (const entry of entriesForDateSlot(entries, date, slot)) {
    if (entry.kind === "booking") {
      used += Math.min(Math.max(entry.seats ?? 1, 1), MAX_RESERVATIONS_PER_SLOT);
    }
  }

  return used;
}

export function getSlotAvailability(
  reservations: ReservationRecord[],
  entries: PlanningEntry[],
  date: string,
  slot: ReservationSlot,
  now = new Date(),
): SlotAvailability {
  const { blocked, reason } = isSlotBlocked(entries, date, slot);
  const used = countSlotUsage(reservations, entries, date, slot, now);
  const available = blocked ? 0 : Math.max(0, MAX_RESERVATIONS_PER_SLOT - used);

  return {
    date,
    slot,
    used,
    max: MAX_RESERVATIONS_PER_SLOT,
    available,
    blocked,
    blockReason: reason,
  };
}

export function canBookSlot(
  reservations: ReservationRecord[],
  entries: PlanningEntry[],
  date: string,
  slot: ReservationSlot,
  locale: "fr" | "en" = "fr",
  now = new Date(),
): { ok: true } | { ok: false; error: string } {
  const availability = getSlotAvailability(reservations, entries, date, slot, now);

  if (availability.blocked) {
    return {
      ok: false,
      error:
        locale === "fr"
          ? "Ce créneau n'est pas disponible à cette date."
          : "This timeslot is not available on this date.",
    };
  }

  if (availability.available <= 0) {
    return {
      ok: false,
      error:
        locale === "fr"
          ? "Ce créneau est complet (3 réservations max). Choisis une autre date ou un autre créneau."
          : "This timeslot is fully booked (max 3 reservations). Please choose another date or slot.",
    };
  }

  return { ok: true };
}
