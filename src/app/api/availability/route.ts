import { NextRequest, NextResponse } from "next/server";
import { getAvailabilityForDate, listPlanningEntries } from "@/lib/planning";
import { getMergedReservations } from "@/lib/reservations";

/** Disponibilité publique pour le formulaire (sans données client). */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date")?.trim();
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  try {
    const [reservations, planningEntries] = await Promise.all([
      getMergedReservations(),
      listPlanningEntries(),
    ]);
    const slots = getAvailabilityForDate(date, reservations, planningEntries);

    return NextResponse.json({
      date,
      slots: slots.map((s) => ({
        slot: s.slot,
        used: s.used,
        max: s.max,
        available: s.available,
        blocked: s.blocked,
      })),
    });
  } catch (error) {
    console.error("availability GET", error);
    return NextResponse.json(
      { error: "Impossible de charger la disponibilité." },
      { status: 500 },
    );
  }
}
