"use client";

import { useEffect, useRef } from "react";
import {
  formatLuxeUpsellPrice,
  getLuxeUpsellFeatures,
  LUXE_UPSELL_AMOUNT,
} from "@/lib/romantic-upsell";

type Props = {
  locale: string;
  open: boolean;
  loading: boolean;
  message: string;
  preselected: boolean;
  onMessageChange: (value: string) => void;
  onAccept: () => void;
  onDecline: () => void;
};

export function ReservationUpsellModal({
  locale,
  open,
  loading,
  message,
  preselected,
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

  const items = getLuxeUpsellFeatures(isFr ? "fr" : "en");

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
          {isFr ? "Option Luxe" : "Luxe Option"}
        </p>
        <h2
          id="upsell-title"
          className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl font-light leading-tight text-[var(--ink)]"
        >
          {isFr
            ? preselected
              ? "Confirmer l'Option Luxe ?"
              : "Ajouter l'Option Luxe ?"
            : preselected
              ? "Confirm the Luxe Option?"
              : "Add the Luxe Option?"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {isFr
            ? `Pour ${formatLuxeUpsellPrice("fr")}, personnalisez votre pique-nique Medium :`
            : `For ${formatLuxeUpsellPrice("en")}, personalise your Medium picnic:`}
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
                ? `Confirmer · ${LUXE_UPSELL_AMOUNT}€`
                : `Confirm · €${LUXE_UPSELL_AMOUNT}`}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onDecline}
            className="flex-1 rounded-xl border border-[var(--bg3)] bg-white px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--ink2)] transition hover:border-[var(--terra)]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFr ? "Continuer sans l'option" : "Continue without"}
          </button>
        </div>
      </div>
    </div>
  );
}
