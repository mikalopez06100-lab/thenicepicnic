import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function ReservationCancelPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFr = locale === "fr";

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="mb-4 font-[family-name:var(--font-cormorant)] text-3xl font-light">
        {isFr ? "Paiement annule" : "Payment cancelled"}
      </h1>
      <p className="text-[var(--muted)]">
        {isFr
          ? "Aucun debit n'a ete effectue. Vous pouvez relancer la reservation a tout moment."
          : "No charge was made. You can restart the booking any time."}
      </p>
      <Link
        href="/reservation"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {isFr ? "← Revenir a la reservation" : "← Back to booking"}
      </Link>
    </main>
  );
}
