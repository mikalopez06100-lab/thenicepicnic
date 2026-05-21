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
  const [reservationDate, setReservationDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];
  const formattedDate = reservationDate
    ? new Date(`${reservationDate}T12:00:00`).toLocaleDateString(
        isFr ? "fr-FR" : "en-US",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
    : isFr
      ? "Non sélectionnée"
      : "Not selected";
  const total = selected.unitAmount * people;
  const formattedTotal = new Intl.NumberFormat(isFr ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
  }).format(total);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedName = customerName.trim();
    const normalizedEmail = customerEmail.trim();
    const normalizedPhone = customerPhone.trim();

    if (!normalizedName || normalizedName.length < 2) {
      setError(
        isFr
          ? "Renseigne un nom valide."
          : "Please provide a valid full name.",
      );
      return;
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(
        isFr ? "Renseigne un email valide." : "Please provide a valid email address.",
      );
      return;
    }
    if (!normalizedPhone || normalizedPhone.length < 8) {
      setError(
        isFr
          ? "Renseigne un numéro de téléphone valide."
          : "Please provide a valid phone number.",
      );
      return;
    }

    if (people < 2) {
      setError(
        isFr
          ? "Le minimum est de 2 personnes."
          : "Minimum booking size is 2 people.",
      );
      return;
    }
    if (!reservationDate) {
      setError(isFr ? "Choisis une date pour la réservation." : "Please choose a date.");
      return;
    }
    if (reservationDate < minDate) {
      setError(
        isFr
          ? "La date choisie ne peut pas être dans le passé."
          : "Selected date cannot be in the past.",
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
          reservationDate,
          customerName: normalizedName,
          customerEmail: normalizedEmail,
          customerPhone: normalizedPhone,
        }),
      });

      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Stripe checkout session error");
      }

      window.location.href = data.url;
    } catch (err) {
      const apiMessage = err instanceof Error ? err.message : "";
      setError(
        apiMessage && apiMessage !== "Stripe checkout session error"
          ? apiMessage
          : isFr
            ? "Impossible de lancer le paiement pour le moment. Réessaie dans quelques instants."
            : "Unable to start payment right now. Please try again shortly.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full rounded-[28px] border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.92)] p-5 shadow-[0_20px_60px_rgba(26,23,20,0.08)] backdrop-blur transition-shadow duration-500 hover:shadow-[0_28px_80px_rgba(26,23,20,0.12)] sm:rounded-[32px] sm:p-7 md:p-10 lg:p-12"
    >
      <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <div className="space-y-8 rounded-[20px] border border-[var(--bg3)] bg-white p-5 sm:space-y-9 sm:rounded-[24px] sm:p-7 md:p-8 lg:p-10">
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {isFr ? "1. Choisis ton pack" : "1. Choose your package"}
            </p>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
              {options.map((o) => {
                const active = o.value === pack;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setPack(o.value)}
                    aria-pressed={active}
                    className={`flex min-h-[118px] flex-col justify-center rounded-2xl border p-4 text-center transition sm:min-h-[128px] sm:p-5 ${
                      active
                        ? "border-[var(--terra)] bg-[rgba(191,107,69,0.08)] shadow-[0_8px_20px_rgba(191,107,69,0.15)] scale-[1.01]"
                        : "border-[var(--bg3)] bg-white hover:-translate-y-0.5 hover:border-[var(--terra)]/40 hover:shadow-[0_10px_24px_rgba(26,23,20,0.08)]"
                    }`}
                  >
                    <p className="font-[family-name:var(--font-cormorant)] text-[28px] leading-[1] text-[var(--ink)] sm:text-[30px]">
                      {o.label}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--muted)]">
                      {o.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {isFr ? "2. Nombre de personnes" : "2. Number of guests"}
            </p>
            <div className="flex h-[92px] items-center justify-between rounded-2xl border border-[var(--bg3)] bg-[var(--bg)] px-4 py-3 sm:h-[96px] sm:px-5">
              <button
                type="button"
                onClick={() => setPeople((current) => Math.max(2, current - 1))}
                className="h-10 w-10 rounded-xl border border-[var(--bg3)] bg-white text-xl text-[var(--ink2)] transition duration-200 hover:scale-105 hover:border-[var(--terra)] active:scale-95"
                aria-label={isFr ? "Retirer une personne" : "Remove one person"}
              >
                -
              </button>
              <div className="text-center">
                <p className="font-[family-name:var(--font-cormorant)] text-[42px] leading-none text-[var(--ink)] sm:text-5xl">
                  {people}
                </p>
                <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                  {isFr ? "Invités" : "Guests"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPeople((current) => Math.min(20, current + 1))}
                className="h-10 w-10 rounded-xl border border-[var(--bg3)] bg-white text-xl text-[var(--ink2)] transition duration-200 hover:scale-105 hover:border-[var(--terra)] active:scale-95"
                aria-label={isFr ? "Ajouter une personne" : "Add one person"}
              >
                +
              </button>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {isFr ? "3. Informations client" : "3. Customer details"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={isFr ? "Nom et prénom" : "Full name"}
                className="h-[54px] w-full rounded-xl border border-[var(--terra)]/35 bg-white px-4 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--terra)] focus:ring-2 focus:ring-[var(--terra)]/20 sm:h-[56px] sm:px-5"
                autoComplete="name"
                required
              />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={isFr ? "Email" : "Email"}
                className="h-[54px] w-full rounded-xl border border-[var(--terra)]/35 bg-white px-4 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--terra)] focus:ring-2 focus:ring-[var(--terra)]/20 sm:h-[56px] sm:px-5"
                autoComplete="email"
                required
              />
            </div>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder={isFr ? "Numéro de téléphone" : "Phone number"}
              className="mt-3 h-[54px] w-full rounded-xl border border-[var(--terra)]/35 bg-white px-4 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--terra)] focus:ring-2 focus:ring-[var(--terra)]/20 sm:mt-4 sm:h-[56px] sm:px-5"
              autoComplete="tel"
              required
            />
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {isFr ? "4. Date" : "4. Date"}
            </p>
            <label
              htmlFor="reservation-date"
              className="block rounded-2xl border border-[var(--bg3)] bg-[var(--bg)] p-3 sm:p-4"
            >
              <input
                id="reservation-date"
                type="date"
                min={minDate}
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
                className="h-[54px] w-full rounded-xl border border-[var(--terra)]/40 bg-white px-4 py-3 text-[14px] text-[var(--ink)] outline-none transition focus:border-[var(--terra)] focus:ring-2 focus:ring-[var(--terra)]/20 sm:h-[56px] sm:px-5 sm:text-[15px]"
                required
              />
            </label>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {isFr ? "5. Créneau" : "5. Timeslot"}
            </p>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[var(--bg3)] bg-[var(--bg)] p-2 sm:gap-4 sm:p-3">
              {slotOptions.map((s) => {
                const active = s.value === slot;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSlot(s.value)}
                    aria-pressed={active}
                    className={`flex h-[50px] items-center justify-center rounded-xl border px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] transition sm:h-[54px] sm:px-3 sm:py-3.5 sm:text-[13px] sm:tracking-[0.1em] ${
                      active
                        ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow-[0_10px_24px_rgba(26,23,20,0.28)]"
                        : "border-[var(--bg3)] bg-white text-[var(--ink)] hover:-translate-y-0.5 hover:border-[var(--terra)]/55 hover:shadow-[0_8px_18px_rgba(26,23,20,0.1)]"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[20px] border border-[var(--bg3)] bg-white p-6 sm:rounded-[24px] sm:p-7 md:sticky md:top-24 lg:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {isFr ? "Récapitulatif instantané" : "Live summary"}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink2)] sm:mt-5">
            {selected.label} × {people}
          </p>
          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            {isFr ? "Créneau :" : "Timeslot:"} {selectedSlot.label}
          </p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            {isFr ? "Date :" : "Date:"} {formattedDate}
          </p>
          <p className="mt-5 font-[family-name:var(--font-cormorant)] text-5xl font-light leading-none text-[var(--terra)] transition-all duration-300 sm:mt-6 sm:text-6xl">
            {formattedTotal}
          </p>
          <p className="mt-4 text-[12px] leading-relaxed text-[var(--muted)] sm:mt-5">
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
            className="mt-6 w-full rounded-xl border border-[var(--terra)] !bg-[var(--terra)] px-5 py-3.5 text-[12px] font-medium uppercase tracking-[0.12em] !text-white transition duration-300 hover:-translate-y-0.5 hover:!bg-[var(--terra2)] hover:shadow-[0_14px_28px_rgba(191,107,69,0.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-8 sm:py-4"
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
