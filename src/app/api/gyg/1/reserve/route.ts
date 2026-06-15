import type { NextRequest } from "next/server";
import { withGygAuth } from "@/lib/gyg/with-gyg-auth";
import { gygError, gygJson, GYG_ERRORS } from "@/lib/gyg/http";
import { handleReserve } from "@/lib/gyg/service";
import type { GygReserveRequest } from "@/lib/gyg/types";
import { formatGygExpiration } from "@/lib/gyg/datetime";

export const POST = withGygAuth(async (req: NextRequest, _ctx) => {
  const body = (await req.json()) as GygReserveRequest;
  if (!body?.productId || !body?.dateTime || !body?.bookingItems?.length) {
    return gygError("INVALID_REQUEST", "Invalid reserve payload.", 400);
  }

  const result = await handleReserve(body);
  if ("error" in result) {
    const meta = GYG_ERRORS[result.error];
    return gygError(result.error, meta.message, meta.status);
  }

  return gygJson({
    data: {
      reservationReference: result.reservationReference,
      reservationExpiration: formatGygExpiration(result.reservationExpiration),
    },
  });
});
