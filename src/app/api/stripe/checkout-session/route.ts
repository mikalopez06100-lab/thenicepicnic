import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  attachSessionIdToReservation,
  createPendingReservation,
  markReservationCancelled,
} from "@/lib/reservations";
import { resolveReservationTime } from "@/lib/reservation-labels";
import { getLuxeUpsellCatalogId, isLuxeUpsellEligible } from "@/lib/romantic-upsell";
import {
  getStripeCatalogId,
  getStripeClient,
  isStripePackageType,
  resolveCheckoutPriceId,
  type StripePackageType,
} from "@/lib/stripe";

type Payload = {
  packageType?: StripePackageType;
  locale?: string;
  quantity?: number;
  slot?: "breakfast" | "lunch" | "aperitif";
  reservationDate?: string;
  reservationTime?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  romanticUpsell?: boolean;
  romanticUpsellMessage?: string;
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
    const reservationDate = body.reservationDate;
    const customerName = (body.customerName ?? "").trim();
    const customerEmail = (body.customerEmail ?? "").trim();
    const customerPhone = (body.customerPhone ?? "").trim();
    const romanticUpsellMessage = (body.romanticUpsellMessage ?? "").trim().slice(0, 280);

    if (!packageType || !isStripePackageType(packageType)) {
      return NextResponse.json({ error: "Invalid package type." }, { status: 400 });
    }

    const romanticUpsell =
      body.romanticUpsell === true && isLuxeUpsellEligible(packageType);

    if (!Number.isInteger(quantity) || quantity < 2 || quantity > 20) {
      return NextResponse.json(
        { error: "Quantity must be an integer between 2 and 20." },
        { status: 400 },
      );
    }

    if (!slot || !["breakfast", "lunch", "aperitif"].includes(slot)) {
      return NextResponse.json({ error: "Invalid timeslot." }, { status: 400 });
    }
    const reservationTime = resolveReservationTime(
      slot,
      body.reservationTime?.trim(),
    );
    if (!reservationDate || !/^\d{4}-\d{2}-\d{2}$/.test(reservationDate)) {
      return NextResponse.json({ error: "Invalid reservation date." }, { status: 400 });
    }
    if (customerName.length < 2) {
      return NextResponse.json({ error: "Invalid customer name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: "Invalid customer email." }, { status: 400 });
    }
    if (customerPhone.length < 8) {
      return NextResponse.json({ error: "Invalid customer phone." }, { status: 400 });
    }

    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const parsedDate = new Date(`${reservationDate}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate < minDate) {
      return NextResponse.json(
        { error: "Reservation date cannot be in the past." },
        { status: 400 },
      );
    }

    const catalogId = getStripeCatalogId(packageType);
    if (!catalogId) {
      return NextResponse.json(
        {
          error: `Missing Stripe catalog ID for ${packageType}. Set STRIPE_PRODUCT_ID_${packageType.toUpperCase()} or STRIPE_PRICE_ID_${packageType.toUpperCase()} in env.`,
        },
        { status: 500 },
      );
    }

    const baseUrl = getBaseUrl(req);
    const localePrefix = locale === "fr" ? "" : "/en";

    const stripe = getStripeClient();
    let priceId: string;
    try {
      priceId = await resolveCheckoutPriceId(stripe, catalogId);
    } catch (catalogError) {
      const message =
        catalogError instanceof Error
          ? catalogError.message
          : "Unable to resolve Stripe price.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const reservationResult = await createPendingReservation({
      packageType,
      reservationDate,
      reservationTime,
      slot,
      quantity,
      locale,
      customerName,
      customerEmail,
      customerPhone,
      romanticUpsell,
      romanticUpsellMessage: romanticUpsell ? romanticUpsellMessage : undefined,
    });
    if (!reservationResult.ok) {
      return NextResponse.json({ error: reservationResult.error }, { status: 409 });
    }

    const reservation = reservationResult.reservation;

    const lineItems: { price: string; quantity: number }[] = [
      { price: priceId, quantity },
    ];

    if (romanticUpsell) {
      const upsellCatalogId = getLuxeUpsellCatalogId();
      if (!upsellCatalogId) {
        await markReservationCancelled(reservation.id);
        return NextResponse.json(
          {
            error:
              "Missing Stripe catalog ID for Option Luxe. Set STRIPE_PRODUCT_ID_LUXE_UPSELL or STRIPE_PRODUCT_ID_ROMANTIC_UPSELL in env.",
          },
          { status: 500 },
        );
      }
      try {
        const upsellPriceId = await resolveCheckoutPriceId(stripe, upsellCatalogId);
        lineItems.push({ price: upsellPriceId, quantity: 1 });
      } catch (upsellError) {
        await markReservationCancelled(reservation.id);
        const message =
          upsellError instanceof Error
            ? upsellError.message
            : "Unable to resolve romantic upsell price.";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: reservation.id,
        line_items: lineItems,
        customer_email: customerEmail,
        success_url: `${baseUrl}${localePrefix}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}${localePrefix}/reservation/cancel`,
        metadata: {
          reservationId: reservation.id,
          packageType,
          locale,
          quantity: String(quantity),
          slot,
          reservationDate,
          reservationTime,
          customerName,
          customerPhone,
          romanticUpsell: romanticUpsell ? "true" : "false",
          romanticUpsellMessage: romanticUpsellMessage || "",
        },
        allow_promotion_codes: true,
        billing_address_collection: "required",
        phone_number_collection: { enabled: true },
      });
    } catch (sessionError) {
      await markReservationCancelled(reservation.id);
      throw sessionError;
    }

    await attachSessionIdToReservation(reservation.id, session.id);

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
