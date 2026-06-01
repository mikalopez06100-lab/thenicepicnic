import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ensureDatabaseSchema, getSql, isDatabaseEnabled } from "@/lib/db";
import type {
  PlanningEntry,
  PlanningEntryKind,
  PlanningSlot,
  PlanningSource,
} from "@/lib/planning-types";

type PlanningStore = {
  entries: PlanningEntry[];
};

type PlanningRow = {
  id: string;
  kind: string;
  entry_date: string;
  slot: string;
  source: string;
  label: string | null;
  note: string | null;
  seats: number | null;
  created_at: string;
  cancelled_at: string | null;
};

function getDataDir() {
  if (process.env.RESERVATIONS_DATA_DIR) {
    return process.env.RESERVATIONS_DATA_DIR;
  }
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "thenicepicnic-data");
  }
  return path.join(process.cwd(), ".data");
}

function getPlanningFile() {
  return path.join(getDataDir(), "planning.json");
}

function rowToEntry(row: PlanningRow): PlanningEntry {
  const date =
    typeof row.entry_date === "string"
      ? row.entry_date.slice(0, 10)
      : String(row.entry_date);

  return {
    id: row.id,
    kind: row.kind as PlanningEntryKind,
    date,
    slot: row.slot as PlanningSlot,
    source: row.source as PlanningSource,
    label: row.label ?? undefined,
    note: row.note ?? undefined,
    seats: row.seats ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
    cancelledAt: row.cancelled_at
      ? new Date(row.cancelled_at).toISOString()
      : undefined,
  };
}

async function readFileStore(): Promise<PlanningStore> {
  const dataDir = getDataDir();
  const file = getPlanningFile();
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as PlanningStore;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    const initial: PlanningStore = { entries: [] };
    await writeFile(file, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function writeFileStore(store: PlanningStore) {
  const dataDir = getDataDir();
  const file = getPlanningFile();
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, JSON.stringify(store, null, 2), "utf8");
}

export async function loadActivePlanningEntries(): Promise<PlanningEntry[]> {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM planning_entries
      WHERE cancelled_at IS NULL
      ORDER BY entry_date ASC, slot ASC
    `) as PlanningRow[];
    return rows.map(rowToEntry);
  }

  const store = await readFileStore();
  return store.entries
    .filter((e) => !e.cancelledAt)
    .sort((a, b) => `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`));
}

export async function insertPlanningEntry(entry: PlanningEntry) {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`
      INSERT INTO planning_entries (
        id, kind, entry_date, slot, source, label, note, seats, created_at, cancelled_at
      ) VALUES (
        ${entry.id},
        ${entry.kind},
        ${entry.date},
        ${entry.slot},
        ${entry.source},
        ${entry.label ?? null},
        ${entry.note ?? null},
        ${entry.seats ?? null},
        ${entry.createdAt},
        ${entry.cancelledAt ?? null}
      )
    `;
    return;
  }

  const store = await readFileStore();
  store.entries.push(entry);
  await writeFileStore(store);
}

export async function cancelPlanningEntryById(id: string): Promise<boolean> {
  const cancelledAt = new Date().toISOString();

  if (isDatabaseEnabled()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      UPDATE planning_entries
      SET cancelled_at = ${cancelledAt}
      WHERE id = ${id} AND cancelled_at IS NULL
      RETURNING id
    `) as { id: string }[];
    return rows.length > 0;
  }

  const store = await readFileStore();
  const entry = store.entries.find((e) => e.id === id && !e.cancelledAt);
  if (!entry) {
    return false;
  }
  entry.cancelledAt = cancelledAt;
  await writeFileStore(store);
  return true;
}
