import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import {
  getDefaultTimeForSlot,
  resolveReservationTime,
} from "@/lib/reservation-labels";
import type {
  ReservationPackage,
  ReservationRecord,
  ReservationSlot,
  ReservationStatus,
} from "@/lib/reservations";

const VALID_PACKAGES = new Set<ReservationPackage>([
  "kit",
  "kit_food",
  "medium",
  "prestige",
]);

const VALID_SLOTS = new Set<ReservationSlot>(["breakfast", "lunch", "aperitif"]);

function parsePackage(value: string | undefined): ReservationPackage | null {
  if (value && VALID_PACKAGES.has(value as ReservationPackage)) {
    return value as ReservationPackage;
  }
  return null;
}

function parseSlot(value: string | undefined): ReservationSlot | null {
  if (value && VALID_SLOTS.has(value as ReservationSlot)) {
    return value as ReservationSlot;
  }
  return null;
}

function mapSessionStatus(session: Stripe.Checkout.Session): ReservationStatus {
  if (session.payment_status === "paid") {
    return "confirmed";
  }
  if (session.status === "expired") {
    return "expired";
  }
  if (session.status === "open") {
    return "pending";
  }
  return "cancelled";
}

export function reservationFromStripeSession(
  session: Stripe.Checkout.Session,
): ReservationRecord | null {
  const metadata = session.metadata ?? {};
  const packageType = parsePackage(metadata.packageType);
  const slot = parseSlot(metadata.slot);
  const reservationDate = metadata.reservationDate;

  if (!packageType || !slot || !reservationDate) {
    return null;
  }

  const quantity = Number(metadata.quantity ?? "2");
  const locale = metadata.locale === "en" ? "en" : "fr";
  const createdAt = new Date((session.created ?? 0) * 1000).toISOString();
  const reservationTime = resolveReservationTime(
    slot,
    metadata.reservationTime,
  );
  const isPaid = session.payment_status === "paid";
  const id =
    (typeof session.client_reference_id === "string" && session.client_reference_id) ||
    metadata.reservationId ||
    session.id;

  const customerEmail =
    session.customer_email ||
    session.customer_details?.email ||
    metadata.customerEmail ||
    "";

  return {
    id,
    createdAt,
    updatedAt: createdAt,
    expiresAt: createdAt,
    status: mapSessionStatus(session),
    packageType,
    reservationDate,
    reservationTime,
    slot,
    quantity: Number.isInteger(quantity) && quantity >= 1 ? quantity : 2,
    paidAt: isPaid ? createdAt : undefined,
    locale,
    customerName: metadata.customerName || "Client",
    customerEmail,
    customerPhone:
      metadata.customerPhone ||
      session.customer_details?.phone ||
      "—",
    stripeSessionId: session.id,
  };
}

export async function fetchReservationsFromStripe(limit = 100): Promise<ReservationRecord[]> {
  const stripe = getStripeClient();
  const results: ReservationRecord[] = [];
  let startingAfter: string | undefined;

  while (results.length < limit) {
    const page = await stripe.checkout.sessions.list({
      limit: Math.min(100, limit - results.length),
      starting_after: startingAfter,
      expand: ["data.customer_details"],
    });

    for (const session of page.data) {
      const record = reservationFromStripeSession(session);
      if (record) {
        results.push(record);
      }
    }

    if (!page.has_more || page.data.length === 0) {
      break;
    }
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function mergeReservations(
  local: ReservationRecord[],
  fromStripe: ReservationRecord[],
): ReservationRecord[] {
  const byKey = new Map<string, ReservationRecord>();

  for (const record of local) {
    const key = record.stripeSessionId || record.id;
    byKey.set(key, record);
  }

  for (const stripeRecord of fromStripe) {
    const key = stripeRecord.stripeSessionId || stripeRecord.id;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, stripeRecord);
      continue;
    }

    // Stripe fait foi pour le statut payé et les coordonnées complètes.
    byKey.set(key, {
      ...existing,
      ...stripeRecord,
      id: existing.id || stripeRecord.id,
      reservationTime:
        stripeRecord.reservationTime ??
        existing.reservationTime ??
        getDefaultTimeForSlot(stripeRecord.slot),
      status:
        stripeRecord.status === "confirmed" ? "confirmed" : existing.status,
      paidAt: stripeRecord.paidAt ?? existing.paidAt,
      stripeSessionId: stripeRecord.stripeSessionId ?? existing.stripeSessionId,
    });
  }

  return [...byKey.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
