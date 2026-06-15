import type { NextRequest } from "next/server";
import { withGygAuth } from "@/lib/gyg/with-gyg-auth";
import { gygError, gygJson, GYG_ERRORS } from "@/lib/gyg/http";
import { handleCancelBooking } from "@/lib/gyg/service";
import type { GygCancelBookingRequest } from "@/lib/gyg/types";

export const POST = withGygAuth(async (req: NextRequest, _ctx) => {
  const body = (await req.json()) as GygCancelBookingRequest;
  const ref = body?.bookingReference;
  if (!ref) {
    return gygError("INVALID_REQUEST", "bookingReference required.", 400);
  }

  const result = await handleCancelBooking(ref);
  if ("error" in result) {
    const meta = GYG_ERRORS[result.error];
    return gygError(result.error, meta.message, meta.status);
  }

  return gygJson({ data: { success: true } });
});
