import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/reservations");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-clip px-5 py-12 sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[rgba(191,107,69,0.14)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-[rgba(71,95,85,0.12)] blur-3xl" />

      <section className="relative w-full max-w-[480px]">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <Image
              src="/images/brand/logo-main.png"
              alt="The Nice Picnic"
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded-full object-cover shadow-[0_12px_32px_rgba(26,23,20,0.18)]"
              priority
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--terra)]">
              The Nice Picnic
            </span>
          </Link>
          <h1 className="mt-5 font-[family-name:var(--font-cormorant)] text-4xl font-light leading-tight text-[var(--ink)] sm:text-5xl">
            Espace Julien
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Connexion sécurisée pour suivre les réservations, les créneaux et les
            paiements confirmés.
          </p>
        </div>

        <div className="rounded-[28px] border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.92)] p-5 shadow-[0_20px_60px_rgba(26,23,20,0.08)] backdrop-blur sm:p-7">
          <div className="rounded-2xl border border-[var(--bg3)] bg-white px-6 py-7 sm:px-7 sm:py-8">
            <AdminLoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          <Link href="/" className="text-[var(--terra)] underline-offset-4 hover:underline">
            ← Retour au site
          </Link>
        </p>
      </section>
    </main>
  );
}
