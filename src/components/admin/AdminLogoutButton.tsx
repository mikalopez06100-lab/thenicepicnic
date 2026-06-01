"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className="rounded-xl border border-[var(--bg3)] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)] transition hover:border-[var(--terra)]/50 hover:text-[var(--terra)] disabled:opacity-60"
    >
      {loading ? "..." : "Déconnexion"}
    </button>
  );
}
