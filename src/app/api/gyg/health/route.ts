import { NextResponse } from "next/server";
import { getGygProducts, isGygIntegrationEnabled } from "@/lib/gyg/config";
import { isDatabaseEnabled } from "@/lib/db";

/** Santé publique (sans auth) — pour vérifier que les routes GYG sont déployées. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    integration: isGygIntegrationEnabled(),
    database: isDatabaseEnabled(),
    products: getGygProducts().map((p) => p.productId),
    endpoints: [
      "GET /api/gyg/1/get-availabilities",
      "POST /api/gyg/1/reserve",
      "POST /api/gyg/1/cancel-reservation",
      "POST /api/gyg/1/book",
      "POST /api/gyg/1/cancel-booking",
      "GET /api/gyg/1/products",
      "GET /api/gyg/1/products/{productId}",
    ],
  });
}
