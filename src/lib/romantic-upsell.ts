export const ROMANTIC_UPSELL_AMOUNT = 39;

export function getRomanticUpsellCatalogId(): string | undefined {
  return (
    process.env.STRIPE_PRODUCT_ID_ROMANTIC_UPSELL ||
    process.env.STRIPE_PRICE_ID_ROMANTIC_UPSELL
  );
}

export function getRomanticUpsellLabel(locale: "fr" | "en" = "fr") {
  return locale === "fr"
    ? "Touche personnalisée"
    : "Personal touch upgrade";
}

export function formatRomanticUpsellPrice(locale: "fr" | "en" = "fr") {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ROMANTIC_UPSELL_AMOUNT);
}
