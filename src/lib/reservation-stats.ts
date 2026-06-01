import {
  formatReservationDateShort,
  getPackageLabel,
  getSlotLabel,
  resolveReservationTime,
} from "@/lib/reservation-labels";
import type { ReservationRecord } from "@/lib/reservations";

export type ReservationStats = {
  total: number;
  confirmed: number;
  totalGuests: number;
  byMonth: { key: string; label: string; count: number; guests: number }[];
  bySlot: { slot: ReservationRecord["slot"]; label: string; count: number }[];
  byPackage: { packageType: ReservationRecord["packageType"]; label: string; count: number }[];
  byWeekday: { day: string; count: number }[];
};

const WEEKDAYS_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export function buildReservationStats(
  reservations: ReservationRecord[],
): ReservationStats {
  const confirmed = reservations.filter((r) => r.status === "confirmed");

  const byMonthMap = new Map<string, { count: number; guests: number }>();
  const bySlotMap = new Map<ReservationRecord["slot"], number>();
  const byPackageMap = new Map<ReservationRecord["packageType"], number>();
  const byWeekdayMap = new Map<number, number>();

  let totalGuests = 0;

  for (const r of confirmed) {
    totalGuests += r.quantity;

    const mk = monthKey(r.reservationDate);
    const monthPrev = byMonthMap.get(mk) ?? { count: 0, guests: 0 };
    byMonthMap.set(mk, {
      count: monthPrev.count + 1,
      guests: monthPrev.guests + r.quantity,
    });

    bySlotMap.set(r.slot, (bySlotMap.get(r.slot) ?? 0) + 1);
    byPackageMap.set(
      r.packageType,
      (byPackageMap.get(r.packageType) ?? 0) + 1,
    );

    const weekday = new Date(`${r.reservationDate}T12:00:00`).getDay();
    byWeekdayMap.set(weekday, (byWeekdayMap.get(weekday) ?? 0) + 1);
  }

  return {
    total: reservations.length,
    confirmed: confirmed.length,
    totalGuests,
    byMonth: [...byMonthMap.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, value]) => ({
        key,
        label: monthLabel(key),
        count: value.count,
        guests: value.guests,
      })),
    bySlot: (["breakfast", "lunch", "aperitif"] as const).map((slot) => ({
      slot,
      label: getSlotLabel(slot),
      count: bySlotMap.get(slot) ?? 0,
    })),
    byPackage: (
      ["kit", "kit_food", "medium", "prestige"] as const
    ).map((packageType) => ({
      packageType,
      label: getPackageLabel(packageType),
      count: byPackageMap.get(packageType) ?? 0,
    })),
    byWeekday: [...byWeekdayMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([day, count]) => ({
        day: WEEKDAYS_FR[day] ?? String(day),
        count,
      })),
  };
}

export function getReservationDisplayTime(record: ReservationRecord) {
  return resolveReservationTime(record.slot, record.reservationTime);
}

export function getReservationDateTimeLabel(record: ReservationRecord) {
  const time = getReservationDisplayTime(record);
  return formatReservationDateShort(record.reservationDate) + ` · ${time}`;
}
