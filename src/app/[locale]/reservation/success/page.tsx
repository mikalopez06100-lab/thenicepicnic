import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function ReservationSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFr = locale === "fr";

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="mb-4 font-[family-name:var(--font-cormorant)] text-3xl font-light">
        {isFr ? "Paiement confirme" : "Payment confirmed"}
      </h1>
      <p className="text-[var(--muted)]">
        {isFr
          ? "Merci, votre reservation est enregistree. Vous recevrez un email de confirmation."
          : "Thank you, your booking has been recorded. You will receive a confirmation email."}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {isFr ? "← Retour a l'accueil" : "← Back to home"}
      </Link>
    </main>
  );
}
