import type { NextRequest } from "next/server";
import { withGygAuth } from "@/lib/gyg/with-gyg-auth";
import { gygError, gygJson } from "@/lib/gyg/http";
import { handleGetAvailabilities } from "@/lib/gyg/service";

function pickDate(value: string | null) {
  if (!value) {
    return null;
  }
  const datePart = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : null;
}

export const GET = withGygAuth(async (req: NextRequest, _ctx) => {
  const params = req.nextUrl.searchParams;
  const productId = params.get("productId")?.trim();
  const fromDate =
    pickDate(params.get("fromDate")) ||
    pickDate(params.get("localDateStart")) ||
    pickDate(params.get("fromDateTime")) ||
    pickDate(params.get("from"));
  const toDate =
    pickDate(params.get("toDate")) ||
    pickDate(params.get("localDateEnd")) ||
    pickDate(params.get("toDateTime")) ||
    pickDate(params.get("to"));

  if (!productId || !fromDate || !toDate) {
    return gygError(
      "INVALID_REQUEST",
      "productId, fromDate and toDate are required.",
      400,
    );
  }

  const result = await handleGetAvailabilities(productId, fromDate, toDate);
  if (!result) {
    return gygError("INVALID_PRODUCT", "Unknown product ID.", 400);
  }

  return gygJson({
    data: {
      productId: result.product.productId,
      availabilities: result.availabilities,
    },
  });
});
