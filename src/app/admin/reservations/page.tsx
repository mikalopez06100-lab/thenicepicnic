import { listReservations } from "@/lib/reservations";

type Props = {
  searchParams: Promise<{ key?: string }>;
};

function slotLabel(slot: "breakfast" | "lunch" | "aperitif") {
  switch (slot) {
    case "breakfast":
      return "Brunch / Petit-déj";
    case "lunch":
      return "Lunch";
    case "aperitif":
      return "Apéro";
    default:
      return slot;
  }
}

export default async function AdminReservationsPage({ searchParams }: Props) {
  const query = await searchParams;
  const expectedKey = process.env.ADMIN_DASHBOARD_KEY;
  const isAuthorized = !expectedKey || query.key === expectedKey;

  if (!isAuthorized) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <h1 className="text-2xl font-semibold">Acces admin refuse</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Ajoute le parametre <code>?key=...</code> avec la cle admin.
        </p>
      </main>
    );
  }

  const { reservations, slotUsage } = await listReservations();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[var(--ink)]">
        Admin reservations
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Capacite max: 3 reservations par date + creneau (tous packs confondus).
      </p>

      <section className="mt-8 rounded-2xl border border-[var(--bg3)] bg-white p-4 md:p-6">
        <h2 className="text-lg font-medium text-[var(--ink)]">Occupation par creneau</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--bg3)] text-[var(--muted)]">
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Creneau</th>
                <th className="px-2 py-2 font-medium">Reservations actives</th>
              </tr>
            </thead>
            <tbody>
              {slotUsage.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-2 py-3 text-[var(--muted)]">
                    Aucune reservation active.
                  </td>
                </tr>
              ) : (
                slotUsage.map((usage) => (
                  <tr key={`${usage.date}-${usage.slot}`} className="border-b border-[var(--bg3)]/60">
                    <td className="px-2 py-2">{usage.date}</td>
                    <td className="px-2 py-2">{slotLabel(usage.slot)}</td>
                    <td className="px-2 py-2">
                      {usage.count} / 3
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--bg3)] bg-white p-4 md:p-6">
        <h2 className="text-lg font-medium text-[var(--ink)]">Liste des reservations</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--bg3)] text-[var(--muted)]">
                <th className="px-2 py-2 font-medium">Statut</th>
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Creneau</th>
                <th className="px-2 py-2 font-medium">Client</th>
                <th className="px-2 py-2 font-medium">Contact</th>
                <th className="px-2 py-2 font-medium">Pack</th>
                <th className="px-2 py-2 font-medium">Pers.</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-3 text-[var(--muted)]">
                    Aucune reservation enregistree.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-[var(--bg3)]/60">
                    <td className="px-2 py-2">
                      <span className="rounded-full bg-[var(--bg2)] px-2 py-1 text-xs uppercase tracking-[0.08em]">
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-2 py-2">{reservation.reservationDate}</td>
                    <td className="px-2 py-2">{slotLabel(reservation.slot)}</td>
                    <td className="px-2 py-2">{reservation.customerName}</td>
                    <td className="px-2 py-2">
                      <div>{reservation.customerEmail}</div>
                      <div className="text-xs text-[var(--muted)]">{reservation.customerPhone}</div>
                    </td>
                    <td className="px-2 py-2">{reservation.packageType}</td>
                    <td className="px-2 py-2">{reservation.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
