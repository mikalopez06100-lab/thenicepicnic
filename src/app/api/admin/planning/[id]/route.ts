import { NextRequest, NextResponse } from "next/server";
import { cancelPlanningEntry } from "@/lib/planning-store";
import { requireAdmin } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const removed = await cancelPlanningEntry(id);
  if (!removed) {
    return NextResponse.json({ error: "Entrée introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
