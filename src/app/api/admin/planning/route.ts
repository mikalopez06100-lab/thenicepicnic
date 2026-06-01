import { NextRequest, NextResponse } from "next/server";
import { addPlanningEntry } from "@/lib/planning-store";
import type {
  PlanningEntryKind,
  PlanningSlot,
  PlanningSource,
} from "@/lib/planning-types";
import { requireAdmin } from "@/lib/admin-auth";

const VALID_SLOTS = new Set<PlanningSlot>([
  "breakfast",
  "lunch",
  "aperitif",
  "day",
]);
const VALID_KINDS = new Set<PlanningEntryKind>(["block", "booking"]);
const VALID_SOURCES = new Set<PlanningSource>([
  "manual",
  "phone",
  "getyourguide",
  "email",
  "other",
]);

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      kind?: PlanningEntryKind;
      date?: string;
      slot?: PlanningSlot;
      source?: PlanningSource;
      label?: string;
      note?: string;
      seats?: number;
    };

    const kind = body.kind;
    const date = body.date?.trim();
    const slot = body.slot;
    const source = body.source ?? "manual";

    if (!kind || !VALID_KINDS.has(kind)) {
      return NextResponse.json({ error: "Type invalide." }, { status: 400 });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Date invalide." }, { status: 400 });
    }
    if (!slot || !VALID_SLOTS.has(slot)) {
      return NextResponse.json({ error: "Créneau invalide." }, { status: 400 });
    }
    if (!VALID_SOURCES.has(source)) {
      return NextResponse.json({ error: "Source invalide." }, { status: 400 });
    }

    const seats =
      kind === "booking" && body.seats !== undefined
        ? Number(body.seats)
        : undefined;
    if (seats !== undefined && (!Number.isInteger(seats) || seats < 1 || seats > 3)) {
      return NextResponse.json(
        { error: "Nombre de places invalide (1 à 3)." },
        { status: 400 },
      );
    }

    const entry = await addPlanningEntry({
      kind,
      date,
      slot,
      source,
      label: body.label,
      note: body.note,
      seats,
    });

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    console.error("admin planning POST", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer l'entrée." },
      { status: 500 },
    );
  }
}
