import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export type StripePackageType = "kit" | "kit_food" | "medium" | "prestige";

const PACKAGE_ENV_KEYS: Record<
  StripePackageType,
  { product: string; price: string }
> = {
  kit: { product: "STRIPE_PRODUCT_ID_KIT", price: "STRIPE_PRICE_ID_KIT" },
  kit_food: {
    product: "STRIPE_PRODUCT_ID_KIT_FOOD",
    price: "STRIPE_PRICE_ID_KIT_FOOD",
  },
  medium: {
    product: "STRIPE_PRODUCT_ID_MEDIUM",
    price: "STRIPE_PRICE_ID_MEDIUM",
  },
  prestige: {
    product: "STRIPE_PRODUCT_ID_PRESTIGE",
    price: "STRIPE_PRICE_ID_PRESTIGE",
  },
};

export function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  return stripeClient;
}

/** Lit les IDs Stripe au runtime (évite l'inlining vide au build Next.js). */
export function getStripeCatalogId(packageType: StripePackageType): string | undefined {
  const keys = PACKAGE_ENV_KEYS[packageType];
  return process.env[keys.product] || process.env[keys.price];
}

export function isStripePackageType(value: string): value is StripePackageType {
  return value in PACKAGE_ENV_KEYS;
}

export async function resolveCheckoutPriceId(
  stripe: Stripe,
  catalogId: string,
): Promise<string> {
  if (catalogId.startsWith("price_")) {
    return catalogId;
  }

  const product = await stripe.products.retrieve(catalogId, {
    expand: ["default_price"],
  });
  const defaultPrice = product.default_price;
  const priceId =
    typeof defaultPrice === "string" ? defaultPrice : defaultPrice?.id;

  if (!priceId) {
    throw new Error(
      `No default Stripe price found for product ${catalogId}. Add a default price in Stripe Dashboard.`,
    );
  }

  return priceId;
}
