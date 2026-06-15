import {
  getGygProduct,
  getGygProducts,
  getGygSupplierId,
  GYG_CATEGORY_ADULT,
  GYG_HOLD_MINUTES,
} from "@/lib/gyg/config";
import { parseGygDateTime } from "@/lib/gyg/datetime";
import { getAvailabilitiesForProductId } from "@/lib/gyg/availability";
import { canAcceptGygBooking } from "@/lib/gyg/capacity";
import {
  cancelGygRecord,
  confirmGygHold,
  createGygHold,
  getGygRecordById,
} from "@/lib/gyg/store";
import { syncGygBookingToPlanning } from "@/lib/gyg/sync-planning";
import { sendGygBookingNotifications } from "@/lib/gyg/notifications";
import type {
  GygBookRequest,
  GygBookingItem,
  GygErrorCode,
  GygReserveRequest,
} from "@/lib/gyg/types";
import { notifyGygAvailabilityChange } from "@/lib/gyg/notify";

function gygErr(error: GygErrorCode) {
  return { error };
}

function sumParticipants(items: GygBookingItem[]) {
  return items.reduce((sum, item) => sum + (item.count || 0), 0);
}

function validateParticipants(count: number, product: NonNullable<ReturnType<typeof getGygProduct>>) {
  if (count < product.minParticipants || count > product.maxParticipants) {
    return false;
  }
  return true;
}

export async function handleGetAvailabilities(
  productId: string,
  fromDate: string,
  toDate: string,
) {
  return getAvailabilitiesForProductId(productId, fromDate, toDate);
}

export async function handleReserve(body: GygReserveRequest) {
  const product = getGygProduct(body.productId);
  if (!product) {
    return gygErr("INVALID_PRODUCT");
  }

  const parsed = parseGygDateTime(body.dateTime);
  if (!parsed) {
    return gygErr("INVALID_REQUEST");
  }

  const adultItems = body.bookingItems.filter(
    (i) => i.category === GYG_CATEGORY_ADULT,
  );
  const participants = sumParticipants(adultItems.length ? adultItems : body.bookingItems);
  if (!validateParticipants(participants, product)) {
    return gygErr("INVALID_REQUEST");
  }

  const canBook = await canAcceptGygBooking(parsed.date, parsed.slot);
  if (!canBook.ok) {
    return gygErr("NO_AVAILABILITY");
  }

  const hold = await createGygHold({
    productId: product.productId,
    reservationDate: parsed.date,
    reservationTime: parsed.time,
    slot: parsed.slot,
    participants,
    gygBookingReference: body.gygBookingReference,
    gygReservationReference: body.reservationReference,
    holdMinutes: GYG_HOLD_MINUTES,
  });

  void notifyGygAvailabilityChange(parsed.date, parsed.slot);

  return {
    reservationReference: hold.id,
    reservationExpiration: hold.expiresAt,
  };
}

export async function handleCancelReservation(reservationReference: string) {
  const record = await getGygRecordById(reservationReference);
  if (!record || record.status !== "held") {
    return gygErr("RESERVATION_NOT_FOUND");
  }
  await cancelGygRecord(record.id);
  void notifyGygAvailabilityChange(record.reservationDate, record.slot);
  return { ok: true as const };
}

export async function handleBook(body: GygBookRequest) {
  const product = getGygProduct(body.productId);
  if (!product) {
    return gygErr("INVALID_PRODUCT");
  }

  const record = await getGygRecordById(body.reservationReference);
  if (!record || record.status !== "held") {
    return gygErr("RESERVATION_NOT_FOUND");
  }

  const travelers = body.travelers;
  const name = [travelers?.firstName, travelers?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const confirmed = await confirmGygHold(record.id, {
    gygBookingReference: body.gygBookingReference,
    customerName: name || "Client GetYourGuide",
    customerEmail: travelers?.email,
    customerPhone: travelers?.phone,
  });

  if (!confirmed) {
    return gygErr("RESERVATION_NOT_FOUND");
  }

  await syncGygBookingToPlanning(confirmed);
  void sendGygBookingNotifications(confirmed);

  void notifyGygAvailabilityChange(
    confirmed.reservationDate,
    confirmed.slot,
  );

  return {
    bookingReference: confirmed.id,
    tickets: [{ category: GYG_CATEGORY_ADULT, ticketCode: confirmed.id }],
  };
}

export async function handleCancelBooking(bookingReference: string) {
  const record = await getGygRecordById(bookingReference);
  if (!record || record.status !== "booked") {
    return gygErr("BOOKING_NOT_FOUND");
  }
  await cancelGygRecord(record.id);
  void notifyGygAvailabilityChange(record.reservationDate, record.slot);
  return { ok: true as const };
}

export function getProductList() {
  return {
    supplierId: getGygSupplierId(),
    products: getGygProducts().map((p) => ({
      productId: p.productId,
      title: p.label,
      description: `Pack ${p.packageType}, ${p.minParticipants}–${p.maxParticipants} participants.`,
    })),
  };
}

export function getProductDetails(productId: string) {
  const product = getGygProduct(productId);
  if (!product) {
    return null;
  }
  return {
    productId: product.productId,
    title: product.label,
    description: `Pique-nique Medium sur la Côte d'Azur.`,
    minParticipants: product.minParticipants,
    maxParticipants: product.maxParticipants,
    currency: product.currency,
  };
}
