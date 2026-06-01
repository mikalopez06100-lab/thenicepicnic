import { randomUUID } from "node:crypto";
import {
  cancelPlanningEntryById,
  insertPlanningEntry,
  loadActivePlanningEntries,
} from "@/lib/planning-persistence";
import type {
  PlanningEntry,
  PlanningEntryKind,
  PlanningSlot,
  PlanningSource,
} from "@/lib/planning-types";

export async function listPlanningEntries(): Promise<PlanningEntry[]> {
  return loadActivePlanningEntries();
}

export async function addPlanningEntry(input: {
  kind: PlanningEntryKind;
  date: string;
  slot: PlanningSlot;
  source: PlanningSource;
  label?: string;
  note?: string;
  seats?: number;
}): Promise<PlanningEntry> {
  const entry: PlanningEntry = {
    id: randomUUID(),
    kind: input.kind,
    date: input.date,
    slot: input.slot,
    source: input.source,
    label: input.label?.trim() || undefined,
    note: input.note?.trim() || undefined,
    seats: input.seats,
    createdAt: new Date().toISOString(),
  };

  await insertPlanningEntry(entry);
  return entry;
}

export async function cancelPlanningEntry(id: string): Promise<boolean> {
  return cancelPlanningEntryById(id);
}
