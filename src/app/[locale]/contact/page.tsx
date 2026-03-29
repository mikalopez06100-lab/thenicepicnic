import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("contact.title")} — The Nice Picnic`,
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="mb-4 font-[family-name:var(--font-cormorant)] text-3xl font-light">
        {t("contact.title")}
      </h1>
      <p className="text-[var(--muted)]">{t("contact.body")}</p>
      <p className="mt-6 text-sm text-[var(--muted)]">{t("contact.details")}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {t("contact.back")}
      </Link>
    </main>
  );
}
