import { isDatabaseEnabled } from "@/lib/db";
import {
  getGygCutoffHours,
  getGygProducts,
  getGygSupplierId,
  isGygIntegrationEnabled,
} from "@/lib/gyg/config";

function authConfigured() {
  const token = process.env.GYG_API_TOKEN?.trim();
  const user = process.env.GYG_API_USERNAME?.trim();
  const pass = process.env.GYG_API_PASSWORD?.trim();
  return Boolean(token || (user && pass));
}

function notifyConfigured() {
  if (process.env.GYG_NOTIFY_ENABLED === "false") {
    return false;
  }
  return Boolean(
    process.env.GYG_NOTIFY_AVAILABILITY_URL?.trim() ||
      process.env.GYG_API_BASE_URL?.trim() ||
      process.env.GYG_ENV === "test",
  );
}

/** Santé publique (sans auth) — pour vérifier que les routes GYG sont déployées. */
export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.thenicepicnic.com";

  return Response.json({
    ok: true,
    integration: isGygIntegrationEnabled(),
    database: isDatabaseEnabled(),
    authConfigured: authConfigured(),
    notifyConfigured: notifyConfigured(),
    supplierId: getGygSupplierId(),
    cutoffHours: getGygCutoffHours(),
    products: getGygProducts().map((p) => ({
      productId: p.productId,
      label: p.label,
      priceEur: p.retailPriceCents / 100,
      slots: p.slots,
    })),
    baseUrl: `${siteUrl}/api/gyg/1`,
    endpoints: [
      "GET /api/gyg/health",
      "GET /api/gyg/1/get-availabilities",
      "POST /api/gyg/1/reserve",
      "POST /api/gyg/1/cancel-reservation",
      "POST /api/gyg/1/book",
      "POST /api/gyg/1/cancel-booking",
      "GET /api/gyg/1/products",
      "GET /api/gyg/1/products/{productId}",
    ],
    docs: {
      supplierApi:
        "https://integrator.getyourguide.com/documentation/supplier_endpoints",
      gygNotify:
        "https://integrator.getyourguide.com/documentation/gyg_endpoints",
      note: "La Partner API (code.getyourguide.com/partner-api-spec) est distincte : elle sert à vendre des activités GYG, pas à exposer vos disponibilités.",
    },
  });
}
