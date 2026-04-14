"use client";

import { FormEvent, useMemo, useState } from "react";

type Props = {
  locale: string;
};

type PackageOption = {
  value: "kit" | "kit_food" | "medium" | "prestige";
  label: string;
  hint: string;
};

export function ReservationCheckoutForm({ locale }: Props) {
  const isFr = locale === "fr";
  const [pack, setPack] = useState<PackageOption["value"]>("medium");
  const [people, setPeople] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo<PackageOption[]>(
    () =>
      isFr
        ? [
            { value: "kit", label: "Le Kit", hint: "29,90 EUR / pers" },
            {
              value: "kit_food",
              label: "Le Kit + food",
              hint: "39,90 EUR / pers",
            },
            { value: "medium", label: "Medium", hint: "59 EUR / pers" },
            { value: "prestige", label: "Prestige", hint: "79 EUR / pers" },
          ]
        : [
            { value: "kit", label: "The Kit", hint: "EUR 29.90 / person" },
            {
              value: "kit_food",
              label: "The Kit + food",
              hint: "EUR 39.90 / person",
            },
            { value: "medium", label: "Medium", hint: "EUR 59 / person" },
            { value: "prestige", label: "Prestige", hint: "EUR 79 / person" },
          ],
    [isFr],
  );

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
        body: JSON.stringify({ packageType: pack, locale, quantity: people }),
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
      className="rounded-xl border border-[var(--bg3)] bg-[var(--white)] p-5 shadow-sm"
    >
      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        {isFr ? "Package" : "Package"}
      </label>
      <select
        className="w-full rounded-md border border-[var(--bg3)] bg-white p-3 text-sm"
        value={pack}
        onChange={(e) => setPack(e.target.value as PackageOption["value"])}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} - {o.hint}
          </option>
        ))}
      </select>

      <label className="mb-2 mt-4 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        {isFr ? "Nombre de personnes (min. 2)" : "Number of people (min. 2)"}
      </label>
      <input
        type="number"
        min={2}
        max={20}
        value={people}
        onChange={(e) => setPeople(Number(e.target.value))}
        className="w-full rounded-md border border-[var(--bg3)] bg-white p-3 text-sm"
      />

      <p className="mt-3 text-xs text-[var(--muted)]">
        {isFr
          ? "Produits Stripe connectes via variables d'environnement (minimum 2 personnes)."
          : "Stripe products are configured via environment variables (minimum 2 people)."}
      </p>

      {error ? (
        <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-md bg-[var(--terra)] px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[var(--terra2)] disabled:opacity-60"
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
