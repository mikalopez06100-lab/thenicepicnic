import { NextResponse } from "next/server";
import type { GygErrorCode } from "@/lib/gyg/types";

export function gygJson<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function gygError(errorCode: GygErrorCode, errorMessage: string, status: number) {
  return NextResponse.json({ errorCode, errorMessage }, { status });
}

export const GYG_ERRORS: Record<GygErrorCode, { status: number; message: string }> = {
  INVALID_PRODUCT: { status: 400, message: "Unknown product ID." },
  INVALID_REQUEST: { status: 400, message: "Invalid request payload." },
  NO_AVAILABILITY: { status: 409, message: "No availability for this slot." },
  AUTHORIZATION_FAILURE: { status: 401, message: "Unauthorized." },
  INTERNAL_ERROR: { status: 500, message: "Internal server error." },
  RESERVATION_NOT_FOUND: { status: 404, message: "Reservation not found." },
  BOOKING_NOT_FOUND: { status: 404, message: "Booking not found." },
};
