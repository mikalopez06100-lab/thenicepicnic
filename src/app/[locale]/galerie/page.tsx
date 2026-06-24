import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { galleryPhotos } from "@/lib/gallery-data";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteNav } from "@/components/home/SiteNav";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("galerie.title")} — The Nice Picnic`,
    description: t("galerie.metaDescription"),
  };
}

export default async function GaleriePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  return (
    <>
      <SiteNav />
      <main className="gallery-page">
        <section className="sec" style={{ background: "var(--bg)" }}>
          <div className="sec-inner">
            <p className="tag">{t("galerie.tag")}</p>
            <h1 className="t font-[family-name:var(--font-cormorant)] text-4xl font-light md:text-5xl">
              {t("galerie.title")}
            </h1>
            <p className="desc">{t("galerie.desc")}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t("galerie.count", { count: galleryPhotos.length })}
            </p>
            <GalleryGrid photos={galleryPhotos} locale={locale} />
            <div className="mt-10 text-center">
              <Link
                href="/reservation"
                className="btn btn-fill"
              >
                {t("galerie.cta")}
              </Link>
            </div>
            <p className="mt-8 text-center">
              <Link
                href="/"
                className="text-sm text-[var(--terra)] underline-offset-4 hover:underline"
              >
                {t("galerie.back")}
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
