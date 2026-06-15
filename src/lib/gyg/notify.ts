import type { ReservationSlot } from "@/lib/reservations";

/**
 * Push availability update vers GetYourGuide (endpoint côté GYG).
 * URL et auth à configurer quand GYG fournit les credentials Notify.
 */
export async function notifyGygAvailabilityChange(
  date: string,
  slot: ReservationSlot,
) {
  const url = process.env.GYG_NOTIFY_AVAILABILITY_URL?.trim();
  if (!url) {
    return;
  }

  const token = process.env.GYG_API_TOKEN || "";
  const productId = process.env.GYG_PRODUCT_ID?.trim() || "medium";

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        productId,
        date,
        slot,
        source: "thenicepicnic",
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.error("notifyGygAvailabilityChange", error);
  }
}
