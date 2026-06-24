import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPlanningCalendar } from "@/components/admin/AdminPlanningCalendar";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildPlanningCalendar } from "@/lib/planning";
import {
  formatPaidAt,
  formatReservationDate,
  formatReservationTime,
  getPackageLabel,
  getSlotLabel,
} from "@/lib/reservation-labels";
import { buildReservationStats, getReservationDisplayTime } from "@/lib/reservation-stats";
import { isDatabaseEnabled } from "@/lib/db";
import { listReservations } from "@/lib/reservations";

type Props = {
  searchParams: Promise<{ key?: string; month?: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  expired: "Expirée",
  cancelled: "Annulée",
};

export default async function AdminReservationsPage({ searchParams }: Props) {
  const query = await searchParams;
  const authorized = await isAdminAuthenticated(query.key);

  if (!authorized) {
    redirect("/admin/login");
  }

  const {
    reservations,
    planningEntries,
    slotUsage,
    stripeSyncError,
    planningError,
    stripeCount,
    localCount,
    storageBackend,
  } = await listReservations();
  const persistentDb = isDatabaseEnabled();
  const stats = buildReservationStats(reservations);
  const stripeDashboardUrl = "https://dashboard.stripe.com/checkout/sessions";

  const now = new Date();
  let calendarYear = now.getFullYear();
  let calendarMonth = now.getMonth();
  const monthParam = query.month?.trim();
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    if (m >= 1 && m <= 12) {
      calendarYear = y;
      calendarMonth = m - 1;
    }
  }
  const calendar = buildPlanningCalendar(
    calendarYear,
    calendarMonth,
    reservations,
    planningEntries,
  );

  return (
    <main className="relative min-h-screen overflow-x-clip px-4 py-10 sm:px-6 md:py-12">
      <div className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-[rgba(191,107,69,0.12)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[rgba(71,95,85,0.1)] blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[var(--bg3)] pb-8">
          <div className="flex items-start gap-4">
            <Image
              src="/images/brand/logo-main.png"
              alt="The Nice Picnic"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover shadow-[0_8px_24px_rgba(26,23,20,0.12)]"
            />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--terra)]">
                Espace Julien
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-cormorant)] text-4xl font-light text-[var(--ink)] md:text-5xl">
                Réservations
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                Capacité max : 3 réservations par date et par créneau (tous packs
                confondus). Les paiements confirmés sont synchronisés depuis Stripe
                ({stripeCount} session(s) trouvée(s)).
                {stats.confirmed > 0
                  ? ` ${stats.confirmed} confirmée(s), ${stats.totalGuests} invité(s) au total.`
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-[var(--bg3)] bg-white px-4 py-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)] transition hover:border-[var(--terra)]/40 hover:text-[var(--terra)]"
            >
              Voir le site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--bg3)] bg-[rgba(255,255,255,0.85)] px-5 py-4 text-sm leading-relaxed text-[var(--ink2)]">
          <p>
            <strong className="text-[var(--ink)]">Où sont les réservations ?</strong>{" "}
            Chaque paiement Stripe est enregistré chez Stripe. L&apos;admin les récupère
            automatiquement à chaque chargement.
            {persistentDb ? (
              <>
                {" "}
                Réservations et planning sont stockés en base PostgreSQL (
                {localCount} en base, backend {storageBackend}).
              </>
            ) : (
              <>
                {" "}
                <strong className="text-red-700">
                  POSTGRES_URL non configuré — le stockage fichier ({localCount}{" "}
                  entrée(s)) est temporaire sur Vercel.
                </strong>
              </>
            )}
          </p>
          <p className="mt-2">
            <a
              href={stripeDashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--terra)] underline-offset-4 hover:underline"
            >
              Ouvrir le tableau de bord Stripe →
            </a>
          </p>
          {stripeSyncError ? (
            <p className="mt-2 text-red-700">
              Erreur de synchronisation Stripe : {stripeSyncError}
            </p>
          ) : null}
          {planningError ? (
            <p className="mt-2 text-red-700">
              Erreur planning : {planningError}
            </p>
          ) : null}
          <p className="mt-3 text-[13px] text-[var(--muted)]">
            <strong className="text-[var(--ink)]">GetYourGuide / résas hors site :</strong>{" "}
            ajoute une réservation externe ou bloque un créneau dans le planning ci-dessous
            dès qu&apos;une vente arrive (téléphone, email, GYG…). Le site refusera alors
            les nouveaux paiements sur ce créneau.
          </p>
        </div>

        <section className="mt-8 rounded-[24px] border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_16px_48px_rgba(26,23,20,0.06)] sm:p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[var(--ink)]">
            Planning des réservations
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            PD = petit-déj, Lu = lunch, Ap = apéro. Cliquez sur un créneau pour ajouter une
            réservation externe ou bloquer.
          </p>
          <div className="mt-5">
            <AdminPlanningCalendar
              initialYear={calendar.year}
              initialMonth={calendar.month}
              weeks={calendar.weeks}
              planningEntries={planningEntries}
            />
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_16px_48px_rgba(26,23,20,0.06)] sm:p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[var(--ink)]">
            Statistiques (réservations confirmées)
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Basées sur la date et l&apos;heure prévues du pique-nique.
          </p>
          {stats.confirmed === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Aucune réservation confirmée pour l&apos;instant.
            </p>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--bg3)] bg-white p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                  Par mois
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {stats.byMonth.map((row) => (
                    <li
                      key={row.key}
                      className="flex justify-between gap-4 border-b border-[var(--bg3)]/60 pb-2 last:border-0"
                    >
                      <span className="capitalize text-[var(--ink2)]">{row.label}</span>
                      <span className="whitespace-nowrap text-[var(--ink)]">
                        {row.count} rés. · {row.guests} pers.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[var(--bg3)] bg-white p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                  Par créneau
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {stats.bySlot.map((row) => (
                    <li
                      key={row.slot}
                      className="flex justify-between gap-4 border-b border-[var(--bg3)]/60 pb-2 last:border-0"
                    >
                      <span className="text-[var(--ink2)]">{row.label}</span>
                      <span className="font-medium text-[var(--ink)]">{row.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[var(--bg3)] bg-white p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                  Par pack
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {stats.byPackage.map((row) => (
                    <li
                      key={row.packageType}
                      className="flex justify-between gap-4 border-b border-[var(--bg3)]/60 pb-2 last:border-0"
                    >
                      <span className="text-[var(--ink2)]">{row.label}</span>
                      <span className="font-medium text-[var(--ink)]">{row.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[var(--bg3)] bg-white p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                  Par jour de la semaine
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {stats.byWeekday.map((row) => (
                    <li
                      key={row.day}
                      className="flex justify-between gap-4 border-b border-[var(--bg3)]/60 pb-2 last:border-0"
                    >
                      <span className="text-[var(--ink2)]">{row.day}</span>
                      <span className="font-medium text-[var(--ink)]">{row.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[24px] border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_16px_48px_rgba(26,23,20,0.06)] sm:p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[var(--ink)]">
            Occupation par créneau
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--bg3)] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--bg3)] bg-[var(--bg)]/60 text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Créneau</th>
                  <th className="px-4 py-3 font-medium">Occupation</th>
                  <th className="px-4 py-3 font-medium">État</th>
                </tr>
              </thead>
              <tbody>
                {slotUsage.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-[var(--muted)]">
                      Aucune réservation active.
                    </td>
                  </tr>
                ) : (
                  slotUsage.map((usage) => (
                    <tr
                      key={`${usage.date}-${usage.slot}`}
                      className="border-b border-[var(--bg3)]/60 last:border-0"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatReservationDate(usage.date)}
                      </td>
                      <td className="px-4 py-3">{getSlotLabel(usage.slot)}</td>
                      <td className="px-4 py-3 font-medium text-[var(--ink)]">
                        {usage.count} / {usage.max}
                      </td>
                      <td className="px-4 py-3">
                        {usage.blocked ? (
                          <span className="text-xs font-medium uppercase text-[#3d3835]">
                            Bloqué
                          </span>
                        ) : usage.count >= usage.max ? (
                          <span className="text-xs font-medium uppercase text-[var(--terra)]">
                            Complet
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--sage)]">Ouvert</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_16px_48px_rgba(26,23,20,0.06)] sm:p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[var(--ink)]">
            Liste des réservations
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--bg3)] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--bg3)] bg-[var(--bg)]/60 text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Date prévue</th>
                  <th className="px-4 py-3 font-medium">Heure</th>
                  <th className="px-4 py-3 font-medium">Créneau</th>
                  <th className="px-4 py-3 font-medium">Payé le</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Pack</th>
                  <th className="px-4 py-3 font-medium">Pers.</th>
                  <th className="px-4 py-3 font-medium">Stripe</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-6 text-[var(--muted)]">
                      Aucune réservation trouvée (vérifie aussi le dashboard Stripe).
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-[var(--bg3)]/60 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${
                            reservation.status === "confirmed"
                              ? "bg-[rgba(71,95,85,0.14)] text-[var(--sage)]"
                              : reservation.status === "pending"
                                ? "bg-[rgba(191,107,69,0.12)] text-[var(--terra)]"
                                : "bg-[var(--bg2)] text-[var(--muted)]"
                          }`}
                        >
                          {STATUS_LABELS[reservation.status] ?? reservation.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatReservationDate(reservation.reservationDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatReservationTime(getReservationDisplayTime(reservation))}
                      </td>
                      <td className="px-4 py-3">{getSlotLabel(reservation.slot)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--muted)]">
                        {formatPaidAt(reservation.paidAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--ink)]">
                        {reservation.customerName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[var(--ink2)]">{reservation.customerEmail}</div>
                        <div className="mt-0.5 text-xs text-[var(--muted)]">
                          {reservation.customerPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{getPackageLabel(reservation.packageType)}</div>
                        {reservation.romanticUpsell ? (
                          <div className="mt-1 text-xs text-[var(--terra)]">
                            + Touche personnalisée
                            {reservation.romanticUpsellMessage ? (
                              <span className="block text-[var(--muted)]">
                                « {reservation.romanticUpsellMessage} »
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{reservation.quantity}</td>
                      <td className="px-4 py-3">
                        {reservation.stripeSessionId ? (
                          <a
                            href={`${stripeDashboardUrl}/${reservation.stripeSessionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--terra)] underline-offset-2 hover:underline"
                          >
                            Voir
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
