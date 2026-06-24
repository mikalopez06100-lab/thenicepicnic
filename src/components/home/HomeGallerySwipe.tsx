"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { GalleryPhoto } from "@/lib/gallery-data";
import { getGalleryPhotoAlt } from "@/lib/gallery";

type Props = {
  photos: GalleryPhoto[];
  locale: string;
  viewAllLabel: string;
  viewAllHref: string;
};

export function HomeGallerySwipe({
  photos,
  locale,
  viewAllLabel,
  viewAllHref,
}: Props) {
  const isFr = locale === "fr";
  const [index, setIndex] = useState(0);
  const total = photos.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + total) % total);
    },
    [total],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [total]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goTo(index - 1);
      }
      if (event.key === "ArrowRight") {
        goTo(index + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index]);

  if (total === 0) {
    return null;
  }

  const photo = photos[index];

  return (
    <div className="gallery-swipe">
      <div className="gallery-swipe-frame">
        {photos.map((item, i) => (
          <div
            key={item.id}
            className={`gallery-swipe-slide ${i === index ? "active" : ""}`}
            aria-hidden={i !== index}
          >
            <Image
              src={item.src}
              alt={getGalleryPhotoAlt(item, locale)}
              fill
              sizes="(max-width:768px) 100vw, 960px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}

        <button
          type="button"
          className="gallery-swipe-nav gallery-swipe-prev"
          onClick={() => goTo(index - 1)}
          aria-label={isFr ? "Photo précédente" : "Previous photo"}
        >
          ‹
        </button>
        <button
          type="button"
          className="gallery-swipe-nav gallery-swipe-next"
          onClick={() => goTo(index + 1)}
          aria-label={isFr ? "Photo suivante" : "Next photo"}
        >
          ›
        </button>
      </div>

      <div className="gallery-swipe-meta">
        <div className="gallery-swipe-dots" role="tablist" aria-label={isFr ? "Photos" : "Photos"}>
          {photos.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${isFr ? "Photo" : "Photo"} ${i + 1}`}
              className={i === index ? "active" : ""}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <a href={viewAllHref} className="gallery-swipe-link">
          {viewAllLabel}
        </a>
      </div>

      <p className="sr-only" aria-live="polite">
        {getGalleryPhotoAlt(photo, locale)}
      </p>
    </div>
  );
}
