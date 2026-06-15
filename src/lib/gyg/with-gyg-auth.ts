import type { NextRequest } from "next/server";
import { verifyGygRequest } from "@/lib/gyg/auth";
import { isGygIntegrationEnabled } from "@/lib/gyg/config";
import { gygError } from "@/lib/gyg/http";

type RouteContext = { params: Promise<Record<string, string | string[]>> };

export function withGygAuth(
  handler: (req: NextRequest, ctx: RouteContext) => Promise<Response> | Response,
) {
  return async (req: NextRequest, ctx: RouteContext) => {
    if (!isGygIntegrationEnabled()) {
      return gygError("INTERNAL_ERROR", "GetYourGuide integration disabled.", 503);
    }
    if (!verifyGygRequest(req)) {
      return gygError("AUTHORIZATION_FAILURE", "Unauthorized.", 401);
    }
    try {
      return await handler(req, ctx);
    } catch (error) {
      console.error("gyg handler error", error);
      return gygError("INTERNAL_ERROR", "Internal server error.", 500);
    }
  };
}
