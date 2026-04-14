"use client";

import { FormEvent, useMemo, useState } from "react";

type Props = {
  locale: string;
  initialPackage?: "kit" | "kit_food" | "medium" | "prestige";
};

type PackageOption = {
  value: "kit" | "kit_food" | "medium" | "prestige";
  label: string;
  hint: string;
  unitAmount: number;
};

type SlotOption = {
  value: "breakfast" | "lunch" | "aperitif";
  label: string;
};

export function ReservationCheckoutForm({ locale, initialPackage }: Props) {
  const isFr = locale === "fr";
  const [pack, setPack] = useState<PackageOption["value"]>(
    initialPackage || "medium",
  );
  const [slot, setSlot] = useState<SlotOption["value"]>("lunch");
  const [people, setPeople] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo<PackageOption[]>(
    () =>
      isFr
        ? [
            {
              value: "kit",
              label: "Le Kit",
              hint: "29,90 EUR / pers",
              unitAmount: 29.9,
            },
            {
              value: "kit_food",
              label: "Le Kit + food",
              hint: "39,90 EUR / pers",
              unitAmount: 39.9,
            },
            {
              value: "medium",
              label: "Medium",
              hint: "59 EUR / pers",
              unitAmount: 59,
            },
            {
              value: "prestige",
              label: "Prestige",
              hint: "79 EUR / pers",
              unitAmount: 79,
            },
          ]
        : [
            {
              value: "kit",
              label: "The Kit",
              hint: "EUR 29.90 / person",
              unitAmount: 29.9,
            },
            {
              value: "kit_food",
              label: "The Kit + food",
              hint: "EUR 39.90 / person",
              unitAmount: 39.9,
            },
            {
              value: "medium",
              label: "Medium",
              hint: "EUR 59 / person",
              unitAmount: 59,
            },
            {
              value: "prestige",
              label: "Prestige",
              hint: "EUR 79 / person",
              unitAmount: 79,
            },
          ],
    [isFr],
  );
  const slotOptions = useMemo<SlotOption[]>(
    () =>
      isFr
        ? [
            { value: "breakfast", label: "Petit-déj" },
            { value: "lunch", label: "Lunch" },
            { value: "aperitif", label: "Apéro" },
          ]
        : [
            { value: "breakfast", label: "Breakfast" },
            { value: "lunch", label: "Lunch" },
            { value: "aperitif", label: "Aperitif" },
          ],
    [isFr],
  );
  const selected = options.find((o) => o.value === pack) ?? options[0];
  const selectedSlot = slotOptions.find((s) => s.value === slot) ?? slotOptions[1];
  const total = selected.unitAmount * people;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (people < 2) {
      setError(
        isFr
          ? "Le minimum est de 2 personnes."
          : "Minimum booking size is 2 people.",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType: pack,
          locale,
          quantity: people,
          slot,
        }),
      });

      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Stripe checkout session error");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(
        isFr
          ? "Impossible de lancer le paiement pour le moment. Verifie les variables Stripe."
          : "Unable to start payment right now. Check Stripe environment variables.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl rounded-2xl border border-[var(--bg3)] bg-[var(--white)] p-6 shadow-sm"
    >
      <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
        {isFr ? "Package" : "Package"}
      </label>
      <select
        className="w-full rounded-xl border border-[var(--bg3)] bg-white p-3 text-sm"
        value={pack}
        onChange={(e) => setPack(e.target.value as PackageOption["value"])}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} - {o.hint}
          </option>
        ))}
      </select>

      <label className="mb-2 mt-4 block text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
        {isFr ? "Nombre de personnes (min. 2)" : "Number of people (min. 2)"}
      </label>
      <input
        type="number"
        min={2}
        max={20}
        value={people}
        onChange={(e) => setPeople(Number(e.target.value))}
        className="w-full rounded-xl border border-[var(--bg3)] bg-white p-3 text-sm"
      />

      <label className="mb-2 mt-4 block text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
        {isFr ? "Créneau" : "Timeslot"}
      </label>
      <select
        className="w-full rounded-xl border border-[var(--bg3)] bg-white p-3 text-sm"
        value={slot}
        onChange={(e) => setSlot(e.target.value as SlotOption["value"])}
      >
        {slotOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="mt-4 rounded-xl border border-[var(--bg3)] bg-[var(--bg)] p-4">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--muted)]">
          {isFr ? "Récapitulatif" : "Summary"}
        </p>
        <p className="mt-2 text-sm text-[var(--ink2)]">
          {selected.label} × {people}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {isFr ? "Créneau :" : "Timeslot:"} {selectedSlot.label}
        </p>
        <p className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl font-light text-[var(--terra)]">
          {new Intl.NumberFormat(isFr ? "fr-FR" : "en-US", {
            style: "currency",
            currency: "EUR",
          }).format(total)}
        </p>
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">
        {isFr
          ? "Produits Stripe connectes via variables d'environnement (minimum 2 personnes)."
          : "Stripe products are configured via environment variables (minimum 2 people)."}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {isFr
          ? "Paiement 100% sécurisé via Stripe."
          : "100% secure payment with Stripe."}
      </p>

      {error ? (
        <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-xl border border-[var(--terra)] !bg-[var(--terra)] px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] !text-white transition hover:!bg-[var(--terra2)] disabled:opacity-60"
      >
        {loading
          ? isFr
            ? "Redirection..."
            : "Redirecting..."
          : isFr
            ? "Payer avec Stripe"
            : "Pay with Stripe"}
      </button>
    </form>
  );
}
