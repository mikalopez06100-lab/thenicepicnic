import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("reservation.title")} — The Nice Picnic`,
  };
}

export default async function ReservationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="mb-4 font-[family-name:var(--font-cormorant)] text-3xl font-light">
        {t("reservation.title")}
      </h1>
      <p className="text-[var(--muted)]">{t("reservation.body")}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {t("reservation.back")}
      </Link>
    </main>
  );
}
