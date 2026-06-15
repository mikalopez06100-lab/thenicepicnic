import type { NextRequest } from "next/server";
import { withGygAuth } from "@/lib/gyg/with-gyg-auth";
import { gygError, gygJson, GYG_ERRORS } from "@/lib/gyg/http";
import { handleCancelReservation } from "@/lib/gyg/service";
import type { GygCancelReservationRequest } from "@/lib/gyg/types";

export const POST = withGygAuth(async (req: NextRequest, _ctx) => {
  const body = (await req.json()) as GygCancelReservationRequest;
  if (!body?.reservationReference) {
    return gygError("INVALID_REQUEST", "reservationReference required.", 400);
  }

  const result = await handleCancelReservation(body.reservationReference);
  if ("error" in result) {
    const meta = GYG_ERRORS[result.error];
    return gygError(result.error, meta.message, meta.status);
  }

  return gygJson({ data: { success: true } });
});
