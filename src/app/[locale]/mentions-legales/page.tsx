import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("mentions.title")} — The Nice Picnic`,
  };
}

export default async function MentionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-8 font-[family-name:var(--font-cormorant)] text-3xl font-light">
        {t("mentions.title")}
      </h1>
      <p className="text-[var(--muted)]">{t("mentions.body")}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {t("mentions.back")}
      </Link>
    </main>
  );
}
