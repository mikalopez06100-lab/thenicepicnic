import { getGygProduct, GYG_DEFAULT_PRODUCT_ID } from "@/lib/gyg/config";
import { buildGygDateTime } from "@/lib/gyg/datetime";
import { getVacanciesForSlot } from "@/lib/gyg/capacity";
import type { ReservationSlot } from "@/lib/reservations";

function getNotifyUrl() {
  const explicit = process.env.GYG_NOTIFY_AVAILABILITY_URL?.trim();
  if (explicit) {
    return explicit;
  }
  const base =
    process.env.GYG_API_BASE_URL?.trim() ||
    (process.env.GYG_ENV === "test"
      ? "https://api.gygtest.net"
      : "https://api.getyourguide.com");
  return `${base.replace(/\/$/, "")}/1/notify-availability-update`;
}

function getNotifyAuthHeader(): Record<string, string> {
  const token =
    process.env.GYG_NOTIFY_TOKEN?.trim() ||
    process.env.GYG_API_TOKEN?.trim() ||
    "";
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  const user = process.env.GYG_API_USERNAME?.trim() || "";
  const pass = process.env.GYG_API_PASSWORD?.trim() || "";
  if (user && pass) {
    return {
      Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`,
    };
  }

  return {};
}

/**
 * Push availability update vers GetYourGuide (endpoint côté GYG).
 * Spec fournisseur : POST /1/notify-availability-update
 * @see https://integrator.getyourguide.com/documentation/gyg_endpoints
 */
export async function notifyGygAvailabilityChange(
  date: string,
  slot: ReservationSlot,
  productId = process.env.GYG_PRODUCT_ID?.trim() || GYG_DEFAULT_PRODUCT_ID,
) {
  if (process.env.GYG_NOTIFY_ENABLED === "false") {
    return;
  }

  const product = getGygProduct(productId);
  if (!product) {
    return;
  }

  const vacancies = await getVacanciesForSlot(date, slot);
  const dateTime = buildGygDateTime(date, slot);

  const payload = {
    data: {
      productId: product.productId,
      availabilities: [
        {
          dateTime,
          vacancies: vacancies.available,
          currency: product.currency,
          pricesByCategory: {
            ADULT: { price: product.retailPriceCents },
          },
        },
      ],
    },
  };

  try {
    const response = await fetch(getNotifyUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getNotifyAuthHeader(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        "notifyGygAvailabilityChange",
        response.status,
        body.slice(0, 500),
      );
    }
  } catch (error) {
    console.error("notifyGygAvailabilityChange", error);
  }
}
