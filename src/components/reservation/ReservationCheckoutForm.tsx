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
  const formattedTotal = new Intl.NumberFormat(isFr ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
  }).format(total);

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
      className="mx-auto w-full max-w-5xl rounded-[28px] border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.86)] p-4 shadow-[0_20px_60px_rgba(26,23,20,0.08)] backdrop-blur md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-2xl border border-[var(--bg3)] bg-white p-5 md:p-6">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              {isFr ? "1. Choisis ton pack" : "1. Choose your package"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((o) => {
                const active = o.value === pack;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setPack(o.value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-[var(--terra)] bg-[rgba(191,107,69,0.08)] shadow-[0_8px_20px_rgba(191,107,69,0.15)]"
                        : "border-[var(--bg3)] bg-white hover:border-[var(--terra)]/40"
                    }`}
                  >
                    <p className="font-[family-name:var(--font-cormorant)] text-2xl leading-none text-[var(--ink)]">
                      {o.label}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{o.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              {isFr ? "2. Nombre de personnes" : "2. Number of guests"}
            </p>
            <div className="flex items-center justify-between rounded-2xl border border-[var(--bg3)] bg-[var(--bg)] px-3 py-2">
              <button
                type="button"
                onClick={() => setPeople((current) => Math.max(2, current - 1))}
                className="h-10 w-10 rounded-xl border border-[var(--bg3)] bg-white text-xl text-[var(--ink2)] transition hover:border-[var(--terra)]"
                aria-label={isFr ? "Retirer une personne" : "Remove one person"}
              >
                -
              </button>
              <div className="text-center">
                <p className="font-[family-name:var(--font-cormorant)] text-4xl leading-none text-[var(--ink)]">
                  {people}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {isFr ? "Invités" : "Guests"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPeople((current) => Math.min(20, current + 1))}
                className="h-10 w-10 rounded-xl border border-[var(--bg3)] bg-white text-xl text-[var(--ink2)] transition hover:border-[var(--terra)]"
                aria-label={isFr ? "Ajouter une personne" : "Add one person"}
              >
                +
              </button>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              {isFr ? "3. Créneau" : "3. Timeslot"}
            </p>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--bg3)] bg-[var(--bg)] p-1.5">
              {slotOptions.map((s) => {
                const active = s.value === slot;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSlot(s.value)}
                    className={`rounded-xl px-2 py-2 text-xs font-medium transition ${
                      active
                        ? "bg-[var(--terra)] text-white shadow-[0_6px_14px_rgba(191,107,69,0.35)]"
                        : "text-[var(--ink2)] hover:bg-white"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-[var(--bg3)] bg-white p-5 md:sticky md:top-24">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            {isFr ? "Récapitulatif instantané" : "Live summary"}
          </p>
          <p className="mt-3 text-sm text-[var(--ink2)]">
            {selected.label} × {people}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {isFr ? "Créneau :" : "Timeslot:"} {selectedSlot.label}
          </p>
          <p className="mt-3 font-[family-name:var(--font-cormorant)] text-5xl font-light leading-none text-[var(--terra)]">
            {formattedTotal}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
            {isFr
              ? "Minimum 2 personnes. Paiement sécurisé et redirection immédiate vers Stripe."
              : "Minimum 2 guests. Secure payment and instant redirect to Stripe."}
          </p>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl border border-[var(--terra)] !bg-[var(--terra)] px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] !text-white transition hover:!bg-[var(--terra2)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? isFr
                ? "Redirection..."
                : "Redirecting..."
              : isFr
                ? "Payer avec Stripe"
                : "Pay with Stripe"}
          </button>
        </aside>
      </div>
    </form>
  );
}
