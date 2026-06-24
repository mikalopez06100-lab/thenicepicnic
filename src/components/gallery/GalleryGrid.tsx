"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { GalleryPhoto } from "@/lib/gallery-data";
import { getGalleryPhotoAlt } from "@/lib/gallery";

type Props = {
  photos: GalleryPhoto[];
  locale: string;
};

export function GalleryGrid({ photos, locale }: Props) {
  const isFr = locale === "fr";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current == null) {
        return current;
      }
      return (current - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current == null) {
        return current;
      }
      return (current + 1) % photos.length;
    });
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex == null) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
      if (event.key === "ArrowLeft") {
        showPrev();
      }
      if (event.key === "ArrowRight") {
        showNext();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, close, showNext, showPrev]);

  const activePhoto = activeIndex != null ? photos[activeIndex] : null;

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="gallery-grid-item"
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={photo.src}
              alt={getGalleryPhotoAlt(photo, locale, index)}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {activePhoto && activeIndex != null ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={isFr ? "Aperçu photo" : "Photo preview"}
          onClick={close}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={close}
            aria-label={isFr ? "Fermer" : "Close"}
          >
            ×
          </button>
          <button
            type="button"
            className="gallery-lightbox-nav gallery-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label={isFr ? "Photo précédente" : "Previous photo"}
          >
            ‹
          </button>
          <div
            className="gallery-lightbox-stage"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gallery-lightbox-image relative">
              <Image
                src={activePhoto.src}
                alt={getGalleryPhotoAlt(activePhoto, locale, activeIndex)}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <p className="gallery-lightbox-caption">
              {getGalleryPhotoAlt(activePhoto, locale, activeIndex)}
            </p>
          </div>
          <button
            type="button"
            className="gallery-lightbox-nav gallery-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label={isFr ? "Photo suivante" : "Next photo"}
          >
            ›
          </button>
        </div>
      ) : null}
    </>
  );
}
