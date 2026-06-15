/**
 * Types alignés sur l’API fournisseur GetYourGuide (Supplier-side).
 * À ajuster si le portail intégrateur impose des noms différents.
 */

export type GygErrorCode =
  | "INVALID_PRODUCT"
  | "INVALID_REQUEST"
  | "NO_AVAILABILITY"
  | "AUTHORIZATION_FAILURE"
  | "INTERNAL_ERROR"
  | "RESERVATION_NOT_FOUND"
  | "BOOKING_NOT_FOUND";

export type GygErrorBody = {
  errorCode: GygErrorCode;
  errorMessage: string;
};

export type GygPriceCategory = {
  category: string;
  price: number;
  currency?: string;
};

export type GygAvailabilityItem = {
  /** ISO 8601 local datetime, ex. 2026-06-15T12:30:00 */
  dateTime: string;
  vacancies: number;
  currency: string;
  pricesByCategory?: Record<string, { price: number }>;
  /** Cut-off en minutes avant le créneau (optionnel). */
  cutoffInMinutes?: number;
};

export type GygGetAvailabilitiesResponse = {
  data: {
    availabilities: GygAvailabilityItem[];
  };
};

export type GygBookingItem = {
  category: string;
  count: number;
};

export type GygReserveRequest = {
  productId: string;
  dateTime: string;
  bookingItems: GygBookingItem[];
  /** Référence réservation côté GYG */
  gygBookingReference?: string;
  reservationReference?: string;
  comment?: string;
};

export type GygReserveResponse = {
  data: {
    reservationReference: string;
    reservationExpiration: string;
  };
};

export type GygBookRequest = {
  productId: string;
  reservationReference: string;
  gygBookingReference: string;
  bookingItems?: GygBookingItem[];
  dateTime?: string;
  comment?: string;
  travelers?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
};

export type GygBookResponse = {
  data: {
    bookingReference: string;
    tickets?: { category: string; ticketCode?: string }[];
  };
};

export type GygCancelReservationRequest = {
  reservationReference: string;
  gygBookingReference?: string;
};

export type GygCancelBookingRequest = {
  bookingReference: string;
  gygBookingReference?: string;
};

export type GygProductListItem = {
  productId: string;
  title: string;
  description?: string;
};

export type GygProductDetails = GygProductListItem & {
  minParticipants: number;
  maxParticipants: number;
  currency: string;
};
