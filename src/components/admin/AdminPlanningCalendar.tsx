"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CalendarDay } from "@/lib/planning-calendar";
import {
  getPlanningSourceLabel,
  type PlanningEntry,
  type PlanningSource,
} from "@/lib/planning-types";
import { getSlotLabel } from "@/lib/reservation-labels";
import type { ReservationSlot } from "@/lib/reservations";

type Props = {
  initialYear: number;
  initialMonth: number;
  weeks: CalendarDay[][];
  planningEntries: PlanningEntry[];
};

const SLOT_SHORT: Record<ReservationSlot, string> = {
  breakfast: "PD",
  lunch: "Lu",
  aperitif: "Ap",
};

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type FormState = {
  kind: "block" | "booking";
  date: string;
  slot: "breakfast" | "lunch" | "aperitif" | "day";
  source: PlanningSource;
  label: string;
  note: string;
  seats: number;
};

function slotCellClass(day: CalendarDay, slot: ReservationSlot) {
  const info = day.slots.find((s) => s.slot === slot);
  if (!info) {
    return "bg-[var(--bg2)] text-[var(--muted)]";
  }
  if (info.blocked) {
    return "bg-[#3d3835] text-white";
  }
  if (info.available === 0) {
    return "bg-[var(--terra)]/90 text-white";
  }
  if (info.used > 0) {
    return "bg-[rgba(71,95,85,0.2)] text-[var(--sage)]";
  }
  return "bg-white text-[var(--ink2)]";
}

export function AdminPlanningCalendar({
  initialYear,
  initialMonth,
  weeks,
  planningEntries,
}: Props) {
  const router = useRouter();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  useEffect(() => {
    setYear(initialYear);
    setMonth(initialMonth);
  }, [initialYear, initialMonth]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    kind: "booking",
    date: "",
    slot: "lunch",
    source: "getyourguide",
    label: "",
    note: "",
    seats: 1,
  });

  const selectedDay = useMemo(() => {
    if (!selectedDate) {
      return null;
    }
    for (const week of weeks) {
      const day = week.find((d) => d.date === selectedDate);
      if (day) {
        return day;
      }
    }
    return null;
  }, [selectedDate, weeks]);

  const entriesForSelected = useMemo(
    () => planningEntries.filter((e) => e.date === selectedDate),
    [planningEntries, selectedDate],
  );

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    router.push(`/admin/reservations?month=${y}-${String(m + 1).padStart(2, "0")}`);
    router.refresh();
  }

  function openForm(date: string, kind: "block" | "booking", slot?: FormState["slot"]) {
    setSelectedDate(date);
    setForm({
      kind,
      date,
      slot: slot ?? "lunch",
      source: kind === "booking" ? "getyourguide" : "manual",
      label: "",
      note: "",
      seats: 1,
    });
    setShowForm(true);
    setError(null);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Erreur");
      }
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function removeEntry(id: string) {
    if (!confirm("Supprimer cette entrée du planning ?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/planning/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Erreur");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="h-9 w-9 rounded-lg border border-[var(--bg3)] bg-white text-lg transition hover:border-[var(--terra)]/50"
            aria-label="Mois précédent"
          >
            ‹
          </button>
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light capitalize text-[var(--ink)]">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="h-9 w-9 rounded-lg border border-[var(--bg3)] bg-white text-lg transition hover:border-[var(--terra)]/50"
            aria-label="Mois suivant"
          >
            ›
          </button>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-white border border-[var(--bg3)]" />
            Libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-[rgba(71,95,85,0.25)]" />
            Partiel
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-[var(--terra)]/90" />
            Complet
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-[#3d3835]" />
            Bloqué
          </span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--bg3)] bg-white">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th
                  key={d}
                  className="border-b border-[var(--bg3)] px-1 py-2 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day) => (
                  <td
                    key={day.date}
                    className={`border border-[var(--bg3)]/50 p-1 align-top ${
                      day.isCurrentMonth ? "" : "opacity-40"
                    } ${day.isToday ? "ring-2 ring-inset ring-[var(--terra)]/40" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(day.date);
                        setShowForm(false);
                      }}
                      className="mb-1 w-full text-left text-[11px] font-medium text-[var(--ink)] hover:text-[var(--terra)]"
                    >
                      {Number(day.date.slice(8, 10))}
                    </button>
                    <div className="flex flex-col gap-0.5">
                      {(["breakfast", "lunch", "aperitif"] as const).map((slot) => {
                        const info = day.slots.find((s) => s.slot === slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            title={`${getSlotLabel(slot)} — ${info?.used ?? 0}/${info?.max ?? 3}`}
                            onClick={() => openForm(day.date, "booking", slot)}
                            className={`rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${slotCellClass(day, slot)}`}
                          >
                            {SLOT_SHORT[slot]}{" "}
                            {info?.blocked ? "✕" : `${info?.used ?? 0}/${info?.max ?? 3}`}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDate ? (
        <div className="mt-6 rounded-2xl border border-[var(--bg3)] bg-[var(--bg)]/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                Journée sélectionnée
              </p>
              <p className="mt-1 font-[family-name:var(--font-cormorant)] text-2xl text-[var(--ink)]">
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openForm(selectedDate, "booking")}
                className="rounded-lg bg-[var(--sage)] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white"
              >
                + Résa externe
              </button>
              <button
                type="button"
                onClick={() => openForm(selectedDate, "block", "day")}
                className="rounded-lg bg-[#3d3835] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white"
              >
                Bloquer la journée
              </button>
              <button
                type="button"
                onClick={() => openForm(selectedDate, "block", "lunch")}
                className="rounded-lg border border-[var(--bg3)] bg-white px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-[var(--ink2)]"
              >
                Bloquer un créneau
              </button>
            </div>
          </div>

          {selectedDay ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {selectedDay.slots.map((s) => (
                <li
                  key={s.slot}
                  className="rounded-xl border border-[var(--bg3)] bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium">{getSlotLabel(s.slot)}</span>
                  <span className="ml-2 text-[var(--muted)]">
                    {s.blocked
                      ? "Bloqué"
                      : `${s.used}/${s.max} — ${s.available} place(s)`}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {entriesForSelected.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {entriesForSelected.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--bg3)] bg-white px-4 py-3 text-sm"
                >
                  <div>
                    <span
                      className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase ${
                        entry.kind === "block"
                          ? "bg-[#3d3835] text-white"
                          : "bg-[var(--sage)]/15 text-[var(--sage)]"
                      }`}
                    >
                      {entry.kind === "block" ? "Blocage" : "Résa"}
                    </span>
                    <span className="text-[var(--ink)]">
                      {entry.slot === "day"
                        ? "Journée entière"
                        : getSlotLabel(entry.slot as ReservationSlot)}
                      {" · "}
                      {getPlanningSourceLabel(entry.source)}
                      {entry.label ? ` — ${entry.label}` : ""}
                    </span>
                    {entry.note ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">{entry.note}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removeEntry(entry.id)}
                    className="text-xs text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Aucune entrée manuelle pour cette date.
            </p>
          )}
        </div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={submitForm}
          className="mt-4 rounded-2xl border border-[var(--terra)]/30 bg-white p-5 shadow-lg"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--terra)]">
            {form.kind === "block" ? "Bloquer" : "Réserver"} — {form.date}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">
                Type
              </span>
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    kind: e.target.value as "block" | "booking",
                  }))
                }
                className="h-10 w-full rounded-lg border border-[var(--bg3)] px-3"
              >
                <option value="booking">Réservation externe</option>
                <option value="block">Blocage</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">
                Créneau
              </span>
              <select
                value={form.slot}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    slot: e.target.value as FormState["slot"],
                  }))
                }
                className="h-10 w-full rounded-lg border border-[var(--bg3)] px-3"
              >
                <option value="breakfast">Petit-déj</option>
                <option value="lunch">Lunch</option>
                <option value="aperitif">Apéro</option>
                <option value="day">Journée entière</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">
                Source
              </span>
              <select
                value={form.source}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    source: e.target.value as PlanningSource,
                  }))
                }
                className="h-10 w-full rounded-lg border border-[var(--bg3)] px-3"
              >
                <option value="getyourguide">GetYourGuide</option>
                <option value="phone">Téléphone</option>
                <option value="email">Email</option>
                <option value="manual">Manuel</option>
                <option value="other">Autre</option>
              </select>
            </label>
            {form.kind === "booking" ? (
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">
                  Places (1–3)
                </span>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={form.seats}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seats: Number(e.target.value) }))
                  }
                  className="h-10 w-full rounded-lg border border-[var(--bg3)] px-3"
                />
              </label>
            ) : null}
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">
                {form.kind === "booking" ? "Nom client" : "Motif"}
              </span>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder={
                  form.kind === "booking"
                    ? "ex. Martin — GetYourGuide"
                    : "ex. Jour off, météo"
                }
                className="h-10 w-full rounded-lg border border-[var(--bg3)] px-3"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">
                Note
              </span>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-[var(--bg3)] px-3 py-2"
              />
            </label>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-red-700">{error}</p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--terra)] px-4 py-2 text-xs font-medium uppercase tracking-wider text-white disabled:opacity-60"
            >
              {loading ? "..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[var(--bg3)] px-4 py-2 text-xs uppercase tracking-wider text-[var(--muted)]"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
