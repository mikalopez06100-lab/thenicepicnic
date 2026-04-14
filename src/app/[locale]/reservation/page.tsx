import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ReservationCheckoutForm } from "@/components/reservation/ReservationCheckoutForm";

type Props = { params: Promise<{ locale: string }> };
type SearchParams = Promise<{ package?: string }>;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("reservation.title")} — The Nice Picnic`,
  };
}

export default async function ReservationPage({
  params,
  searchParams,
}: Props & { searchParams: SearchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const isFr = locale === "fr";
  const requestedPackage = (query.package || "").toLowerCase();
  const initialPackage = (
    ["kit", "kit_food", "medium", "prestige"] as const
  ).includes(requestedPackage as "kit" | "kit_food" | "medium" | "prestige")
    ? (requestedPackage as "kit" | "kit_food" | "medium" | "prestige")
    : undefined;

  return (
    <main className="flex min-h-screen items-center bg-[var(--bg)]">
      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--terra)]">
          {isFr ? "Réservation" : "Booking"}
        </p>
        <h1 className="mb-3 mt-3 text-center font-[family-name:var(--font-cormorant)] text-5xl font-light leading-tight">
          {t("reservation.title")}
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-center text-[var(--muted)]">
          {isFr
            ? "Choisis ton package, indique le nombre de personnes (minimum 2), puis finalise le paiement sécurisé Stripe."
            : "Choose your package, set the number of guests (minimum 2), then complete secure Stripe payment."}
        </p>

        <ReservationCheckoutForm locale={locale} initialPackage={initialPackage} />

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block text-[var(--terra)] underline-offset-4 hover:underline"
          >
            {t("reservation.back")}
          </Link>
        </div>
      </section>
    </main>
  );
}
