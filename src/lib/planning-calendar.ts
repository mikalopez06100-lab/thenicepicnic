import {
  ALL_SLOTS,
  getSlotAvailability,
  type SlotAvailability,
} from "@/lib/slot-capacity";
import type { PlanningEntry } from "@/lib/planning-types";
import type { ReservationRecord, ReservationSlot } from "@/lib/reservations";

export type CalendarDay = {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  slots: SlotAvailability[];
  entries: PlanningEntry[];
};

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildPlanningCalendar(
  year: number,
  month: number,
  reservations: ReservationRecord[],
  planningEntries: PlanningEntry[],
): { year: number; month: number; weeks: CalendarDay[][] } {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const todayKey = toDateKey(new Date());
  const weeks: CalendarDay[][] = [];
  const cursor = new Date(start);

  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dateKey = toDateKey(cursor);
      const slots = ALL_SLOTS.map((slot) =>
        getSlotAvailability(reservations, planningEntries, dateKey, slot),
      );
      const entries = planningEntries.filter(
        (e) =>
          e.date === dateKey &&
          !e.cancelledAt &&
          (e.slot === "day" || ALL_SLOTS.includes(e.slot as ReservationSlot)),
      );

      week.push({
        date: dateKey,
        isCurrentMonth: cursor.getMonth() === month,
        isToday: dateKey === todayKey,
        slots,
        entries,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (w >= 4 && cursor.getMonth() !== month && cursor.getDate() > 7) {
      break;
    }
  }

  return { year, month, weeks };
}

export function getAvailabilityForDate(
  date: string,
  reservations: ReservationRecord[],
  planningEntries: PlanningEntry[],
) {
  return ALL_SLOTS.map((slot) =>
    getSlotAvailability(reservations, planningEntries, date, slot),
  );
}
