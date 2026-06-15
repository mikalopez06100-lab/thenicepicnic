import { getDefaultTimeForSlot } from "@/lib/reservation-labels";
import type { ReservationSlot } from "@/lib/reservations";
import { getGygTimezone } from "@/lib/gyg/config";

export function parseGygDateTime(dateTime: string): {
  date: string;
  time: string;
  slot: ReservationSlot;
} | null {
  const match = dateTime.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/,
  );
  if (!match) {
    return null;
  }
  const date = match[1];
  const time = `${match[2]}:${match[3]}`;
  const slot = inferSlotFromTime(time);
  if (!slot) {
    return null;
  }
  return { date, time, slot };
}

export function inferSlotFromTime(time: string): ReservationSlot | null {
  const [h, m] = time.split(":").map(Number);
  const minutes = h * 60 + m;
  if (minutes < 11 * 60) {
    return "breakfast";
  }
  if (minutes < 16 * 60) {
    return "lunch";
  }
  if (minutes >= 17 * 60) {
    return "aperitif";
  }
  return null;
}

export function buildGygDateTime(date: string, slot: ReservationSlot) {
  const time = getDefaultTimeForSlot(slot);
  return `${date}T${time}:00`;
}

export function eachDateInRange(fromDate: string, toDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${fromDate}T12:00:00`);
  const end = new Date(`${toDate}T12:00:00`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) {
    return dates;
  }
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function isPastCutoff(date: string, time: string, cutoffHours: number) {
  const slotDate = new Date(`${date}T${time}:00`);
  const cutoff = new Date(Date.now() + cutoffHours * 60 * 60 * 1000);
  return slotDate < cutoff;
}

export function formatGygExpiration(iso: string) {
  return iso.replace(/\.\d{3}Z$/, "").replace(/Z$/, "");
}
