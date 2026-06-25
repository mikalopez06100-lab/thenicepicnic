import { setRequestLocale, getTranslations } from "next-intl/server";
import { HomeView } from "@/components/home/HomeView";
import { getHomeFaqItems } from "@/lib/faq-data";
import { getGooglePlaceReviews } from "@/lib/google-places";
import { buildFaqJsonLd, buildLocalBusinessJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const googleReviews = await getGooglePlaceReviews();
  const structuredData = buildLocalBusinessJsonLd(locale, googleReviews);
  const faqJsonLd = buildFaqJsonLd(getHomeFaqItems(locale));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeView googleReviews={googleReviews} />
    </>
  );
}
