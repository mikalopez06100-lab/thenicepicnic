import { sendReservationNotifications } from "@/lib/reservation-notifications";
import type { GygReservationRecord } from "@/lib/gyg/store";
import type { ReservationRecord } from "@/lib/reservations";

function toReservationRecord(record: GygReservationRecord): ReservationRecord {
  const now = new Date().toISOString();
  return {
    id: record.id,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    expiresAt: record.expiresAt,
    status: "confirmed",
    packageType: "medium",
    reservationDate: record.reservationDate,
    reservationTime: record.reservationTime,
    slot: record.slot,
    quantity: record.participants,
    paidAt: record.bookedAt ?? now,
    locale: "fr",
    customerName: record.customerName || "Client GetYourGuide",
    customerEmail: record.customerEmail || "noreply@getyourguide.com",
    customerPhone: record.customerPhone || "—",
  };
}

export async function sendGygBookingNotifications(record: GygReservationRecord) {
  try {
    await sendReservationNotifications(toReservationRecord(record));
  } catch (error) {
    console.error("sendGygBookingNotifications", error);
  }
}
