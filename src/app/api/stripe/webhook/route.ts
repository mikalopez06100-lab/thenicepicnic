import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { markReservationExpiredBySession } from "@/lib/reservations";
import { confirmPaidCheckoutSession } from "@/lib/reservation-confirm";
import { getStripeClient } from "@/lib/stripe";

async function handlePaidSession(session: Stripe.Checkout.Session) {
  const result = await confirmPaidCheckoutSession(session);
  if (result && !result.alreadyConfirmed && !result.notified) {
    throw new Error("Reservation confirmation emails could not be sent.");
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature or secret." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripeClient();
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaidSession(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markReservationExpiredBySession(session.id);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error", err);
    const message = err instanceof Error ? err.message : "Webhook handler failed.";
    const status = message.includes("emails could not be sent") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
