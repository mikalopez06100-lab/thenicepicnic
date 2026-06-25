import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FaqCategories } from "@/components/faq/FaqCategories";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteNav } from "@/components/home/SiteNav";
import { getAllFaqItems, getFaqCategories } from "@/lib/faq-data";
import { buildFaqJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("faq.title")} — The Nice Picnic`,
    description: t("faq.metaDescription"),
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const categories = getFaqCategories(locale);
  const faqJsonLd = buildFaqJsonLd(getAllFaqItems(locale));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteNav />
      <main>
        <section className="sec" style={{ background: "var(--bg)" }}>
          <div className="sec-inner">
            <p className="tag">{t("faq.tag")}</p>
            <h1 className="t font-[family-name:var(--font-cormorant)] text-4xl font-light md:text-5xl">
              {t("faq.title")}
            </h1>
            <p className="desc">{t("faq.desc")}</p>
            <FaqCategories categories={categories} />
            <p className="mt-10 text-center">
              <Link
                href="/"
                className="text-sm text-[var(--terra)] underline-offset-4 hover:underline"
              >
                {t("faq.back")}
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
