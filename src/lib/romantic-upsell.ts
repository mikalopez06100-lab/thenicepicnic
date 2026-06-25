export const LUXE_UPSELL_AMOUNT = 39;

/** @deprecated use LUXE_UPSELL_AMOUNT */
export const ROMANTIC_UPSELL_AMOUNT = LUXE_UPSELL_AMOUNT;

export function isLuxeUpsellEligible(packageType: string) {
  return packageType === "medium";
}

export function getLuxeUpsellCatalogId(): string | undefined {
  return (
    process.env.STRIPE_PRODUCT_ID_LUXE_UPSELL ||
    process.env.STRIPE_PRODUCT_ID_ROMANTIC_UPSELL ||
    process.env.STRIPE_PRICE_ID_LUXE_UPSELL ||
    process.env.STRIPE_PRICE_ID_ROMANTIC_UPSELL
  );
}

/** @deprecated use getLuxeUpsellCatalogId */
export const getRomanticUpsellCatalogId = getLuxeUpsellCatalogId;

export function getLuxeUpsellLabel(locale: "fr" | "en" = "fr") {
  return locale === "fr" ? "Option Luxe" : "Luxe Option";
}

/** @deprecated use getLuxeUpsellLabel */
export const getRomanticUpsellLabel = getLuxeUpsellLabel;

export function getLuxeUpsellFeatures(locale: "fr" | "en" = "fr") {
  return locale === "fr"
    ? [
        "Remplacement de la bouteille de vin par une bouteille de champagne",
        "5 à 7 photos imprimées et installées sur site à votre arrivée",
        "Un mot personnel sur une carte",
      ]
    : [
        "Wine bottle replaced with a bottle of champagne",
        "5 to 7 printed photos set up on site before you arrive",
        "A personal message on a card",
      ];
}

export function formatLuxeUpsellPrice(locale: "fr" | "en" = "fr") {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(LUXE_UPSELL_AMOUNT);
}

/** @deprecated use formatLuxeUpsellPrice */
export const formatRomanticUpsellPrice = formatLuxeUpsellPrice;
