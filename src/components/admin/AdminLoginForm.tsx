"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Connexion impossible.");
      }
      router.push("/admin/reservations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="admin-email"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="julien@exemple.com"
          required
          className="block h-[52px] w-full rounded-xl border border-[var(--terra)]/35 bg-white px-4 text-[15px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/60 focus:border-[var(--terra)] focus:ring-2 focus:ring-[var(--terra)]/20"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]"
        >
          Mot de passe
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          required
          className="block h-[52px] w-full rounded-xl border border-[var(--terra)]/35 bg-white px-4 text-[15px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/60 focus:border-[var(--terra)] focus:ring-2 focus:ring-[var(--terra)]/20"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl border border-[var(--terra)] bg-[var(--terra)] px-4 py-3.5 text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(191,107,69,0.28)] transition hover:-translate-y-0.5 hover:bg-[var(--terra2)] hover:shadow-[0_14px_28px_rgba(191,107,69,0.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Connexion en cours…" : "Se connecter"}
      </button>
    </form>
  );
}
