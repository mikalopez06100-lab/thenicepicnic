import Stripe from "stripe";

let stripeClient: Stripe | null = null;

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

export const STRIPE_PRICE_IDS = {
  kit: process.env.STRIPE_PRODUCT_ID_KIT,
  kit_food: process.env.STRIPE_PRODUCT_ID_KIT_FOOD,
  medium: process.env.STRIPE_PRODUCT_ID_MEDIUM,
  prestige: process.env.STRIPE_PRODUCT_ID_PRESTIGE,
} as const;
