import { addPlanningEntry } from "@/lib/planning-store";
import type { GygReservationRecord } from "@/lib/gyg/store";

/** Réplique la résa GYG confirmée dans le planning admin (évite double saisie). */
export async function syncGygBookingToPlanning(record: GygReservationRecord) {
  try {
    await addPlanningEntry({
      kind: "booking",
      date: record.reservationDate,
      slot: record.slot,
      source: "getyourguide",
      label: record.customerName || `GYG ${record.gygBookingReference || record.id}`,
      note: `Réf. GYG: ${record.gygBookingReference || "—"} · ${record.participants} pers.`,
      seats: 1,
    });
  } catch (error) {
    console.error("syncGygBookingToPlanning", error);
  }
}
