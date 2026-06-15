import type { NextRequest } from "next/server";
import { withGygAuth } from "@/lib/gyg/with-gyg-auth";
import { gygError, gygJson } from "@/lib/gyg/http";
import { getProductDetails } from "@/lib/gyg/service";

export const GET = withGygAuth(async (_req: NextRequest, { params }) => {
  const raw = (await params).productId;
  const productId = Array.isArray(raw) ? raw[0] : raw;
  const details = getProductDetails(productId);
  if (!details) {
    return gygError("INVALID_PRODUCT", "Unknown product ID.", 400);
  }
  return gygJson({ data: details });
});
