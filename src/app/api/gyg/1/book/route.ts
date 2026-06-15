import type { NextRequest } from "next/server";
import { withGygAuth } from "@/lib/gyg/with-gyg-auth";
import { gygError, gygJson, GYG_ERRORS } from "@/lib/gyg/http";
import { handleBook } from "@/lib/gyg/service";
import type { GygBookRequest } from "@/lib/gyg/types";

export const POST = withGygAuth(async (req: NextRequest, _ctx) => {
  const body = (await req.json()) as GygBookRequest;
  if (
    !body?.productId ||
    !body?.reservationReference ||
    !body?.gygBookingReference
  ) {
    return gygError("INVALID_REQUEST", "Invalid book payload.", 400);
  }

  const result = await handleBook(body);
  if ("error" in result) {
    const meta = GYG_ERRORS[result.error];
    return gygError(result.error, meta.message, meta.status);
  }

  return gygJson({ data: result });
});
