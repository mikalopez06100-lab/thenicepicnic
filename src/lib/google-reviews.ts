export type GoogleReview = {
  authorName: string;
  authorUri: string | null;
  authorPhotoUri: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string | null;
};

export type GooglePlaceReviews = {
  placeName: string;
  rating: number;
  userRatingCount: number;
  googleMapsUri: string | null;
  reviews: GoogleReview[];
  fetchedAt: string;
};

export function isGoogleReviewsConfigured() {
  return Boolean(
    process.env.GOOGLE_PLACES_API_KEY?.trim() &&
      process.env.GOOGLE_PLACE_ID?.trim(),
  );
}
