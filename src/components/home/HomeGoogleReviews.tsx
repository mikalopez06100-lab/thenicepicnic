import Image from "next/image";
import type { GooglePlaceReviews } from "@/lib/google-reviews";

type Props = {
  data: GooglePlaceReviews;
  locale: string;
  viewAllLabel: string;
  poweredByLabel: string;
  emptyLabel: string;
  leaveReviewLabel: string;
};

function StarRating({
  rating,
  label,
}: {
  rating: number;
  label: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="google-stars" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = rounded >= starValue;
        const half = !filled && rounded >= starValue - 0.5;
        return (
          <span
            key={starValue}
            className={`google-star ${filled ? "filled" : half ? "half" : ""}`}
            aria-hidden
          >
            ★
          </span>
        );
      })}
    </span>
  );
}

export function HomeGoogleReviews({
  data,
  locale,
  viewAllLabel,
  poweredByLabel,
  emptyLabel,
  leaveReviewLabel,
}: Props) {
  const isFr = locale === "fr";
  const hasRating = data.userRatingCount > 0 && data.rating > 0;
  const ratingLabel = isFr
    ? `Note ${data.rating} sur 5`
    : `Rated ${data.rating} out of 5`;

  return (
    <div className="google-reviews">
      <div className="google-reviews-summary">
        <div className="google-reviews-score">
          {hasRating ? (
            <>
              <span className="google-reviews-number">{data.rating.toFixed(1)}</span>
              <StarRating rating={data.rating} label={ratingLabel} />
              <p className="google-reviews-count">
                {isFr
                  ? `${data.userRatingCount} avis sur Google`
                  : `${data.userRatingCount} Google reviews`}
              </p>
            </>
          ) : (
            <>
              <p className="google-reviews-empty">{emptyLabel}</p>
              <p className="google-reviews-count">{data.placeName}</p>
            </>
          )}
        </div>
        {data.googleMapsUri ? (
          <a
            href={data.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="google-reviews-cta"
          >
            {hasRating ? viewAllLabel : leaveReviewLabel}
          </a>
        ) : null}
      </div>

      {data.reviews.length > 0 ? (
        <div className="google-reviews-grid">
        {data.reviews.map((review) => (
          <article key={`${review.authorName}-${review.publishTime}`} className="google-review-card">
            <div className="google-review-top">
              {review.authorPhotoUri ? (
                <Image
                  src={review.authorPhotoUri}
                  alt=""
                  width={40}
                  height={40}
                  className="google-review-avatar"
                  unoptimized
                />
              ) : (
                <span className="google-review-avatar-fallback" aria-hidden>
                  {review.authorName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div>
                {review.authorUri ? (
                  <a
                    href={review.authorUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-review-author"
                  >
                    {review.authorName}
                  </a>
                ) : (
                  <p className="google-review-author">{review.authorName}</p>
                )}
                <div className="google-review-meta">
                  <StarRating
                    rating={review.rating}
                    label={`${review.rating}/5`}
                  />
                  {review.relativeTime ? (
                    <span className="google-review-time">{review.relativeTime}</span>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="google-review-text">{review.text}</p>
          </article>
        ))}
        </div>
      ) : null}

      <p className="google-reviews-powered">{poweredByLabel}</p>
    </div>
  );
}
