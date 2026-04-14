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
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[var(--bg)]">
      <div className="pointer-events-none absolute -left-20 top-8 h-64 w-64 rounded-full bg-[rgba(191,107,69,0.12)] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-6 h-72 w-72 rounded-full bg-[rgba(71,95,85,0.12)] blur-3xl" />

      <section className="relative mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-16">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--terra)]">
          {isFr ? "Réservation" : "Booking"}
        </p>
        <h1 className="mb-3 mt-3 text-center font-[family-name:var(--font-cormorant)] text-4xl font-light leading-tight md:text-6xl">
          {t("reservation.title")}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-[var(--muted)] md:mb-10 md:text-base">
          {isFr
            ? "Choisis ton package, indique le nombre de personnes (minimum 2), puis finalise le paiement sécurisé Stripe."
            : "Choose your package, set the number of guests (minimum 2), then complete secure Stripe payment."}
        </p>

        <ReservationCheckoutForm locale={locale} initialPackage={initialPackage} />

        <div className="mt-8 text-center md:mt-10">
          <Link
            href="/"
            className="inline-block text-sm text-[var(--terra)] underline-offset-4 hover:underline"
          >
            {t("reservation.back")}
          </Link>
        </div>
      </section>
    </main>
  );
}
