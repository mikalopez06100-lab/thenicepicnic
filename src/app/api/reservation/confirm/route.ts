import { NextRequest, NextResponse } from "next/server";
import { confirmPaidCheckoutSession } from "@/lib/reservation-confirm";
import { getStripeClient } from "@/lib/stripe";

type Payload = { sessionId?: string };

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as Payload;
    const sessionId = body.sessionId?.trim();
    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid session id." }, { status: 400 });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const result = await confirmPaidCheckoutSession(session);
    if (!result) {
      return NextResponse.json(
        { error: "Payment not completed or reservation unavailable." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      alreadyConfirmed: result.alreadyConfirmed,
      notified: result.notified,
    });
  } catch (error) {
    console.error("reservation/confirm error", error);
    return NextResponse.json(
      { error: "Unable to confirm reservation." },
      { status: 500 },
    );
  }
}
