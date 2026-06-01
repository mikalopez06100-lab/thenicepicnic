import type { ReservationSlot } from "@/lib/reservations";

export type PlanningSource =
  | "manual"
  | "phone"
  | "getyourguide"
  | "email"
  | "other";

export type PlanningEntryKind = "block" | "booking";

/** `day` = bloque les 3 créneaux (petit-déj, lunch, apéro). */
export type PlanningSlot = ReservationSlot | "day";

export type PlanningEntry = {
  id: string;
  kind: PlanningEntryKind;
  date: string;
  slot: PlanningSlot;
  source: PlanningSource;
  label?: string;
  note?: string;
  seats?: number;
  createdAt: string;
  cancelledAt?: string;
};

const SOURCE_LABELS: Record<PlanningSource, string> = {
  manual: "Manuel",
  phone: "Téléphone",
  getyourguide: "GetYourGuide",
  email: "Email",
  other: "Autre",
};

export function getPlanningSourceLabel(source: PlanningSource) {
  return SOURCE_LABELS[source] ?? source;
}
