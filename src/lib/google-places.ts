import { unstable_cache } from "next/cache";
import type { GooglePlaceReviews, GoogleReview } from "@/lib/google-reviews";

const REVALIDATE_SECONDS = 3600;

type PlacesReview = {
  rating?: number;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  text?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type PlacesResponse = {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

function mapReview(review: PlacesReview): GoogleReview | null {
  const text = review.text?.text?.trim();
  if (!text) {
    return null;
  }

  return {
    authorName: review.authorAttribution?.displayName?.trim() || "Client Google",
    authorUri: review.authorAttribution?.uri ?? null,
    authorPhotoUri: review.authorAttribution?.photoUri ?? null,
    rating: review.rating ?? 5,
    text,
    relativeTime: review.relativePublishTimeDescription ?? "",
    publishTime: review.publishTime ?? null,
  };
}

async function fetchGooglePlaceReviews(): Promise<GooglePlaceReviews | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();

  if (!apiKey || !placeId) {
    return null;
  }

  const fieldMask = [
    "displayName",
    "rating",
    "userRatingCount",
    "googleMapsUri",
    "reviews",
  ].join(",");

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Google Places API", response.status, body.slice(0, 400));
    return null;
  }

  const data = (await response.json()) as PlacesResponse;
  const reviews = (data.reviews ?? [])
    .map(mapReview)
    .filter((review): review is GoogleReview => review !== null)
    .slice(0, 5);

  if (!data.rating || reviews.length === 0) {
    return null;
  }

  return {
    placeName: data.displayName?.text ?? "The Nice Picnic",
    rating: data.rating,
    userRatingCount: data.userRatingCount ?? reviews.length,
    googleMapsUri: data.googleMapsUri ?? null,
    reviews,
    fetchedAt: new Date().toISOString(),
  };
}

const getCachedGoogleReviews = unstable_cache(
  fetchGooglePlaceReviews,
  ["google-place-reviews"],
  { revalidate: REVALIDATE_SECONDS, tags: ["google-reviews"] },
);

export async function getGooglePlaceReviews() {
  if (!process.env.GOOGLE_PLACES_API_KEY?.trim() || !process.env.GOOGLE_PLACE_ID?.trim()) {
    return null;
  }
  return getCachedGoogleReviews();
}
