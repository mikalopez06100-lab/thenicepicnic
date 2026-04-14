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
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-3 text-center font-[family-name:var(--font-cormorant)] text-4xl font-light">
        {t("reservation.title")}
      </h1>
      <p className="mb-8 text-center text-[var(--muted)]">
        {isFr
          ? "Choisis ton package puis lance le paiement Stripe."
          : "Choose your package and continue to Stripe checkout."}
      </p>

      <ReservationCheckoutForm locale={locale} initialPackage={initialPackage} />

      <Link
        href="/"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {t("reservation.back")}
      </Link>
    </main>
  );
}
