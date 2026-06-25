"use client";

import { useEffect, useRef } from "react";

type Props = {
  sessionId?: string;
};

export function ReservationConfirmationTrigger({ sessionId }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (!sessionId || sent.current) {
      return;
    }
    sent.current = true;

    void fetch("/api/reservation/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch((error) => {
      console.error("confirmation email trigger failed", error);
    });
  }, [sessionId]);

  return null;
}
