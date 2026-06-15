import type { ReservationSlot } from "@/lib/reservations";

/** Produit Medium 2–8 pers. sur GetYourGuide (ID externe côté TNP). */
export const GYG_DEFAULT_PRODUCT_ID = "medium";

export const GYG_MIN_PARTICIPANTS = 2;
export const GYG_MAX_PARTICIPANTS = 8;

/** Durée du hold panier GYG (minutes). */
export const GYG_HOLD_MINUTES = 60;

/** Catégorie billet GYG pour le pack Medium (par personne). */
export const GYG_CATEGORY_ADULT = "ADULT";

export type GygProductConfig = {
  productId: string;
  packageType: "medium";
  label: string;
  minParticipants: number;
  maxParticipants: number;
  /** Prix adulte en centimes EUR (59 €). */
  retailPriceCents: number;
  currency: "EUR";
  slots: ReservationSlot[];
};

const PRODUCTS: GygProductConfig[] = [
  {
    productId: GYG_DEFAULT_PRODUCT_ID,
    packageType: "medium",
    label: "Medium — Pique-nique haut de gamme (2 à 8 pers.)",
    minParticipants: GYG_MIN_PARTICIPANTS,
    maxParticipants: GYG_MAX_PARTICIPANTS,
    retailPriceCents: 5900,
    currency: "EUR",
    slots: ["breakfast", "lunch", "aperitif"],
  },
];

export function getGygProducts(): GygProductConfig[] {
  const extraId = process.env.GYG_PRODUCT_ID?.trim();
  if (extraId && extraId !== GYG_DEFAULT_PRODUCT_ID) {
    return [
      ...PRODUCTS,
      { ...PRODUCTS[0], productId: extraId },
    ];
  }
  return PRODUCTS;
}

export function getGygProduct(productId: string): GygProductConfig | null {
  const id = productId.trim();
  const fromEnv = process.env.GYG_PRODUCT_ID?.trim();
  if (fromEnv && id === fromEnv) {
    return PRODUCTS[0];
  }
  return getGygProducts().find((p) => p.productId === id) ?? null;
}

export function getGygSupplierId() {
  return process.env.GYG_SUPPLIER_ID?.trim() || "thenicepicnic";
}

export function getGygTimezone() {
  return process.env.GYG_TIMEZONE?.trim() || "Europe/Paris";
}

export function getGygCutoffHours() {
  const n = Number(process.env.GYG_BOOKING_CUTOFF_HOURS ?? "24");
  return Number.isFinite(n) && n >= 0 ? n : 24;
}

export function isGygIntegrationEnabled() {
  return process.env.GYG_INTEGRATION_ENABLED !== "false";
}
