import type { ReservationPackage, ReservationSlot } from "@/lib/reservations";

const PACKAGE_LABELS: Record<ReservationPackage, string> = {
  kit: "Le Kit",
  kit_food: "Le Kit + food",
  medium: "Medium",
  prestige: "Prestige",
};

const SLOT_LABELS: Record<ReservationSlot, string> = {
  breakfast: "Petit-déj / Brunch",
  lunch: "Lunch",
  aperitif: "Apéro",
};

export const SLOT_DEFAULT_TIMES: Record<ReservationSlot, string> = {
  breakfast: "09:00",
  lunch: "12:30",
  aperitif: "18:30",
};

export function getPackageLabel(packageType: ReservationPackage) {
  return PACKAGE_LABELS[packageType] ?? packageType;
}

export function getSlotLabel(slot: ReservationSlot) {
  return SLOT_LABELS[slot] ?? slot;
}

export function getDefaultTimeForSlot(slot: ReservationSlot) {
  return SLOT_DEFAULT_TIMES[slot];
}

export function resolveReservationTime(
  slot: ReservationSlot,
  reservationTime?: string,
) {
  if (reservationTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(reservationTime)) {
    return reservationTime;
  }
  return SLOT_DEFAULT_TIMES[slot];
}

export function formatReservationDate(date: string, locale: "fr" | "en" = "fr") {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

export function formatReservationDateShort(date: string, locale: "fr" | "en" = "fr") {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export function formatReservationTime(time: string, locale: "fr" | "en" = "fr") {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(
  date: string,
  time: string,
  locale: "fr" | "en" = "fr",
) {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date(`${date}T12:00:00`);
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPaidAt(iso: string | undefined, locale: "fr" | "en" = "fr") {
  if (!iso) {
    return "—";
  }
  return new Date(iso).toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
