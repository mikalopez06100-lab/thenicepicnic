import {
  getGygCutoffHours,
  getGygProduct,
  type GygProductConfig,
} from "@/lib/gyg/config";
import { buildGygDateTime, eachDateInRange, isPastCutoff } from "@/lib/gyg/datetime";
import { getVacanciesForSlot } from "@/lib/gyg/capacity";
import type { GygAvailabilityItem } from "@/lib/gyg/types";
import type { ReservationSlot } from "@/lib/reservations";

export async function buildAvailabilitiesForProduct(
  product: GygProductConfig,
  fromDate: string,
  toDate: string,
): Promise<GygAvailabilityItem[]> {
  const cutoffHours = getGygCutoffHours();
  const dates = eachDateInRange(fromDate, toDate);
  const items: GygAvailabilityItem[] = [];

  for (const date of dates) {
    for (const slot of product.slots) {
      const time = buildGygDateTime(date, slot).slice(11, 16);
      if (isPastCutoff(date, time, cutoffHours)) {
        items.push(buildAvailabilityRow(product, date, slot, 0, cutoffHours));
        continue;
      }

      const vacancies = await getVacanciesForSlot(date, slot);
      items.push(
        buildAvailabilityRow(
          product,
          date,
          slot,
          vacancies.available,
          cutoffHours,
        ),
      );
    }
  }

  return items;
}

function buildAvailabilityRow(
  product: GygProductConfig,
  date: string,
  slot: ReservationSlot,
  vacancies: number,
  cutoffHours: number,
): GygAvailabilityItem {
  const dateTime = buildGygDateTime(date, slot);
  return {
    dateTime,
    vacancies,
    currency: product.currency,
    pricesByCategory: {
      ADULT: { price: product.retailPriceCents },
    },
    cutoffInMinutes: cutoffHours * 60,
  };
}

export async function getAvailabilitiesForProductId(
  productId: string,
  fromDate: string,
  toDate: string,
) {
  const product = getGygProduct(productId);
  if (!product) {
    return null;
  }
  const availabilities = await buildAvailabilitiesForProduct(
    product,
    fromDate,
    toDate,
  );
  return { product, availabilities };
}
