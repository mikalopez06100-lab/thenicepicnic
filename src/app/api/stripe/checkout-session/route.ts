import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, STRIPE_PRICE_IDS } from "@/lib/stripe";

type PackageType = keyof typeof STRIPE_PRICE_IDS;

type Payload = {
  packageType?: PackageType;
  locale?: string;
  quantity?: number;
  slot?: "breakfast" | "lunch" | "aperitif";
};

function getBaseUrl(req: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`
  );
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY in environment variables." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as Payload;
    const packageType = body.packageType;
    const locale = body.locale === "en" ? "en" : "fr";
    const quantity = Number(body.quantity ?? 2);
    const slot = body.slot;

    if (!packageType || !(packageType in STRIPE_PRICE_IDS)) {
      return NextResponse.json({ error: "Invalid package type." }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 2 || quantity > 20) {
      return NextResponse.json(
        { error: "Quantity must be an integer between 2 and 20." },
        { status: 400 },
      );
    }

    if (!slot || !["breakfast", "lunch", "aperitif"].includes(slot)) {
      return NextResponse.json({ error: "Invalid timeslot." }, { status: 400 });
    }

    const productId = STRIPE_PRICE_IDS[packageType];
    if (!productId) {
      return NextResponse.json(
        {
          error: `Missing Stripe product ID for ${packageType}. Set STRIPE_PRODUCT_ID_* in env.`,
        },
        { status: 500 },
      );
    }

    const baseUrl = getBaseUrl(req);
    const localePrefix = locale === "fr" ? "" : "/en";

    const stripe = getStripeClient();
    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });
    const defaultPrice = product.default_price as Stripe.Price | null;

    if (!defaultPrice?.id) {
      return NextResponse.json(
        {
          error: `No default Stripe price found for product ${packageType}.`,
        },
        { status: 500 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: defaultPrice.id, quantity }],
      success_url: `${baseUrl}${localePrefix}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${localePrefix}/reservation/cancel`,
      metadata: {
        packageType,
        locale,
        quantity: String(quantity),
        slot,
        // TODO: add deposit flow (pre-authorization 200 EUR)
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("checkout-session error", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create Stripe checkout session.";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
