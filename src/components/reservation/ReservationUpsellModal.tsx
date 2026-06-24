"use client";

import { useEffect, useRef } from "react";
import { formatRomanticUpsellPrice, ROMANTIC_UPSELL_AMOUNT } from "@/lib/romantic-upsell";

type Props = {
  locale: string;
  open: boolean;
  loading: boolean;
  message: string;
  onMessageChange: (value: string) => void;
  onAccept: () => void;
  onDecline: () => void;
};

export function ReservationUpsellModal({
  locale,
  open,
  loading,
  message,
  onMessageChange,
  onAccept,
  onDecline,
}: Props) {
  const isFr = locale === "fr";
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      acceptRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const items = isFr
    ? [
        "Remplacement du rosé par une bouteille de champagne",
        "5 à 7 photos imprimées et installées sur site",
        "Petit mot personnalisé sur une carte",
      ]
    : [
        "Rosé replaced with a bottle of champagne",
        "5 to 7 printed photos set up on site",
        "Personal handwritten note on a card",
      ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,23,20,0.55)] p-4 backdrop-blur-sm"
      role="presentation"
      onClick={() => !loading && onDecline()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upsell-title"
        className="w-full max-w-lg rounded-[24px] border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-[0_28px_80px_rgba(26,23,20,0.22)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--terra)]">
          {isFr ? "Option spéciale" : "Special add-on"}
        </p>
        <h2
          id="upsell-title"
          className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl font-light leading-tight text-[var(--ink)]"
        >
          {isFr ? "Une touche personnalisée ?" : "Add a personal touch?"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {isFr
            ? `Pour ${formatRomanticUpsellPrice("fr")} (pour 2), sublimez votre moment :`
            : `For ${formatRomanticUpsellPrice("en")} (for 2), elevate your experience:`}
        </p>

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-relaxed text-[var(--ink2)]"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--terra)]" />
              {item}
            </li>
          ))}
        </ul>

        <label className="mt-5 block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            {isFr
              ? "Votre mot pour la carte (optionnel)"
              : "Your message for the card (optional)"}
          </span>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder={
              isFr
                ? "Ex. : Joyeux anniversaire mon amour…"
                : "E.g. Happy birthday my love…"
            }
            className="w-full resize-none rounded-xl border border-[var(--terra)]/35 bg-white px-3.5 py-3 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--terra)] focus:ring-2 focus:ring-[var(--terra)]/20"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            ref={acceptRef}
            type="button"
            disabled={loading}
            onClick={onAccept}
            className="flex-1 rounded-xl border border-[var(--terra)] bg-[var(--terra)] px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[var(--terra2)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? isFr
                ? "Redirection..."
                : "Redirecting..."
              : isFr
                ? `Ajouter pour ${ROMANTIC_UPSELL_AMOUNT}€`
                : `Add for €${ROMANTIC_UPSELL_AMOUNT}`}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onDecline}
            className="flex-1 rounded-xl border border-[var(--bg3)] bg-white px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--ink2)] transition hover:border-[var(--terra)]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFr ? "Non merci" : "No thanks"}
          </button>
        </div>
      </div>
    </div>
  );
}
