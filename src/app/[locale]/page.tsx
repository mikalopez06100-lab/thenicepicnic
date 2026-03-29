import { setRequestLocale } from "next-intl/server";
import { HomeView } from "@/components/home/HomeView";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "The Nice Picnic",
  description:
    "Pique-niques exclusifs et insolites clé en main sur la Côte d'Azur — Nice, French Riviera.",
  url: "https://thenicepicnic.fr",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nice",
    addressRegion: "Provence-Alpes-Côte d'Azur",
    addressCountry: "FR",
  },
  areaServed: "Côte d'Azur",
  priceRange: "€€",
};

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const structuredData = {
    ...jsonLd,
    inLanguage: locale === "en" ? "en" : "fr",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeView />
    </>
  );
}
