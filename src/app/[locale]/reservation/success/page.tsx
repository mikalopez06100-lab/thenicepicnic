import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { ReservationConfirmationTrigger } from "@/components/reservation/ReservationConfirmationTrigger";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export default async function ReservationSuccessPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { session_id: sessionId } = await searchParams;
  setRequestLocale(locale);
  const isFr = locale === "fr";

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <ReservationConfirmationTrigger sessionId={sessionId} />
      <h1 className="mb-4 font-[family-name:var(--font-cormorant)] text-3xl font-light">
        {isFr ? "Paiement confirmé" : "Payment confirmed"}
      </h1>
      <p className="text-[var(--muted)]">
        {isFr
          ? "Merci, votre réservation est enregistrée. Un email de confirmation vient de vous être envoyé."
          : "Thank you, your booking has been recorded. A confirmation email has been sent to you."}
      </p>
      <p className="mt-3 text-sm text-[var(--muted)]">
        {isFr
          ? "Les coordonnées du spot vous seront communiquées 24h avant la prestation."
          : "Spot coordinates will be shared 24 hours before your experience."}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {isFr ? "← Retour à l'accueil" : "← Back to home"}
      </Link>
    </main>
  );
}
