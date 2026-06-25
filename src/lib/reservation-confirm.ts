import type Stripe from "stripe";
import {
  getReservationById,
  markReservationConfirmed,
  type ReservationRecord,
} from "@/lib/reservations";
import { sendReservationNotifications } from "@/lib/reservation-notifications";
import {
  reservationFromStripeSession,
} from "@/lib/reservations-stripe";
import {
  saveReservation,
  updateReservationByStripeSession,
} from "@/lib/reservations-persistence";

export type ConfirmResult = {
  reservation: ReservationRecord;
  notified: boolean;
  alreadyConfirmed: boolean;
};

function isPaidSession(session: Stripe.Checkout.Session) {
  return session.payment_status === "paid";
}

async function upsertConfirmedFromSession(
  session: Stripe.Checkout.Session,
  existing?: ReservationRecord | null,
): Promise<ReservationRecord | null> {
  const now = new Date().toISOString();
  const reservationId =
    (typeof session.client_reference_id === "string" &&
      session.client_reference_id) ||
    session.metadata?.reservationId;

  if (reservationId) {
    const confirmed = await markReservationConfirmed(reservationId, session.id);
    if (confirmed) {
      return confirmed;
    }
  }

  const bySession = await updateReservationByStripeSession(session.id, (record) => {
    if (record.status === "confirmed") {
      return record;
    }
    return {
      ...record,
      status: "confirmed",
      updatedAt: now,
      paidAt: now,
      stripeSessionId: session.id,
    };
  });
  if (bySession) {
    return bySession;
  }

  const fromStripe = reservationFromStripeSession(session);
  if (!fromStripe) {
    return existing ?? null;
  }

  const reservation: ReservationRecord = {
    ...fromStripe,
    id: existing?.id || fromStripe.id,
    status: "confirmed",
    updatedAt: now,
    paidAt: now,
    stripeSessionId: session.id,
    customerEmail:
      fromStripe.customerEmail ||
      session.customer_details?.email ||
      existing?.customerEmail ||
      "",
    customerPhone:
      fromStripe.customerPhone ||
      session.customer_details?.phone ||
      existing?.customerPhone ||
      "—",
    customerName:
      fromStripe.customerName ||
      session.customer_details?.name ||
      existing?.customerName ||
      "Client",
  };

  await saveReservation(reservation);
  return reservation;
}

export async function confirmPaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<ConfirmResult | null> {
  if (!isPaidSession(session)) {
    return null;
  }

  const reservationId =
    (typeof session.client_reference_id === "string" &&
      session.client_reference_id) ||
    session.metadata?.reservationId;

  const existing = reservationId
    ? await getReservationById(reservationId)
    : null;
  const alreadyConfirmed = existing?.status === "confirmed";

  const reservation = await upsertConfirmedFromSession(session, existing);
  if (!reservation || !reservation.customerEmail) {
    return null;
  }

  let notified = false;
  if (!alreadyConfirmed) {
    const result = await sendReservationNotifications(reservation, session);
    notified = result.admin && result.customer;
    if (!notified) {
      console.error("Reservation emails incomplete", {
        reservationId: reservation.id,
        admin: result.admin,
        customer: result.customer,
      });
    }
  }

  return { reservation, notified, alreadyConfirmed };
}
