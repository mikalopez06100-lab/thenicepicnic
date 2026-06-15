import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const colon = decoded.indexOf(":");
    if (colon < 0) {
      return null;
    }
    return {
      username: decoded.slice(0, colon),
      password: decoded.slice(colon + 1),
    };
  } catch {
    return null;
  }
}

/**
 * Auth attendue : Basic (user/pass fournis par GYG) ou Bearer token.
 * Variables : GYG_API_USERNAME, GYG_API_PASSWORD, GYG_API_TOKEN
 */
export function verifyGygRequest(req: NextRequest): boolean {
  if (process.env.GYG_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production") {
    return true;
  }

  const expectedUser = process.env.GYG_API_USERNAME || "";
  const expectedPass = process.env.GYG_API_PASSWORD || "";
  const expectedToken = process.env.GYG_API_TOKEN || "";

  if (expectedToken) {
    const auth = req.headers.get("authorization");
    if (auth === `Bearer ${expectedToken}`) {
      return true;
    }
    if (auth?.startsWith("Bearer ") && safeEqual(auth.slice(7), expectedToken)) {
      return true;
    }
  }

  if (expectedUser && expectedPass) {
    const basic = parseBasicAuth(req.headers.get("authorization"));
    if (
      basic &&
      safeEqual(basic.username, expectedUser) &&
      safeEqual(basic.password, expectedPass)
    ) {
      return true;
    }
  }

  return false;
}
