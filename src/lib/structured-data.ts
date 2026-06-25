import type { GooglePlaceReviews } from "@/lib/google-reviews";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thenicepicnic.com").replace(
    /\/$/,
    "",
  );
}

export function buildFaqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildArticleJsonLd(post: {
  title: string;
  description: string;
  date: string;
  image: string;
  slug: string;
  author: string;
}) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    image: post.image.startsWith("http") ? post.image : `${url}${post.image}`,
    mainEntityOfPage: `${url}/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "The Nice Picnic",
      logo: {
        "@type": "ImageObject",
        url: `${url}/images/brand/logo-main.png`,
      },
    },
  };
}

export function buildLocalBusinessJsonLd(
  locale: string,
  googleReviews: GooglePlaceReviews | null,
) {
  const url = siteUrl();
  const isFr = locale === "fr";

  const base = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}/#localbusiness`,
    name: "The Nice Picnic",
    description: isFr
      ? "Pique-niques exclusifs et insolites clé en main sur la Côte d'Azur — Nice, French Riviera."
      : "Exclusive turnkey picnics on the French Riviera — Nice, France.",
    url,
    image: `${url}/opengraph-image.png`,
    email: "hello@thenicepicnic.com",
    priceRange: "€€",
    servesCuisine: isFr ? "Cuisine niçoise" : "Niçoise cuisine",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nice",
      addressRegion: "Provence-Alpes-Côte d'Azur",
      postalCode: "06000",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.7102,
      longitude: 7.262,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "French Riviera",
    },
    inLanguage: isFr ? "fr" : "en",
    sameAs: [
      "https://www.instagram.com/the.nicepicnic/",
      ...(googleReviews?.googleMapsUri ? [googleReviews.googleMapsUri] : []),
    ],
  };

  if (
    !googleReviews ||
    googleReviews.userRatingCount <= 0 ||
    googleReviews.rating <= 0
  ) {
    return base;
  }

  return {
    ...base,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: googleReviews.rating,
      reviewCount: googleReviews.userRatingCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: googleReviews.reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.authorName,
      },
      datePublished: review.publishTime?.slice(0, 10),
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.text,
    })),
  };
}
