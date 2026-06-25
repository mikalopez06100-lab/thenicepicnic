import { setRequestLocale } from "next-intl/server";
import { HomeView } from "@/components/home/HomeView";
import { getGooglePlaceReviews } from "@/lib/google-places";
import { buildLocalBusinessJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const googleReviews = await getGooglePlaceReviews();
  const structuredData = buildLocalBusinessJsonLd(locale, googleReviews);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeView googleReviews={googleReviews} />
    </>
  );
}
