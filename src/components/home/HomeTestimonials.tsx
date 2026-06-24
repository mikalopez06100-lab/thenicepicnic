"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TestimonialVideo } from "@/lib/testimonials-data";

type Props = {
  videos: TestimonialVideo[];
  locale: string;
  playLabel: string;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
};

export function HomeTestimonials({
  videos,
  locale,
  playLabel,
  closeLabel,
  prevLabel,
  nextLabel,
}: Props) {
  const isFr = locale === "fr";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current == null) {
        return current;
      }
      return (current - 1 + videos.length) % videos.length;
    });
  }, [videos.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current == null) {
        return current;
      }
      return (current + 1) % videos.length;
    });
  }, [videos.length]);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeIndex == null) {
      return;
    }

    video.load();
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        /* autoplay bloqué — l'utilisateur peut lancer via les contrôles natifs */
      });
    }

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [activeIndex]);

  if (videos.length === 0) {
    return null;
  }

  const activeVideo = activeIndex != null ? videos[activeIndex] : null;

  return (
    <>
      <div className="testimonials-grid">
        {videos.map((video, index) => (
          <button
            key={video.id}
            type="button"
            className="testimonial-card"
            onClick={() => setActiveIndex(index)}
            aria-label={`${playLabel} ${index + 1}`}
          >
            <Image
              src={video.poster}
              alt=""
              fill
              sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 180px"
              className="object-cover"
            />
            <span className="testimonial-play" aria-hidden>
              ▶
            </span>
          </button>
        ))}
      </div>

      {activeVideo && activeIndex != null ? (
        <div
          className="testimonial-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={isFr ? "Témoignage vidéo" : "Video testimonial"}
          onClick={close}
        >
          <button
            type="button"
            className="testimonial-lightbox-close"
            onClick={close}
            aria-label={closeLabel}
          >
            ×
          </button>
          <button
            type="button"
            className="testimonial-lightbox-nav testimonial-lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              showPrev();
            }}
            aria-label={prevLabel}
          >
            ‹
          </button>
          <div
            className="testimonial-lightbox-stage"
            onClick={(event) => event.stopPropagation()}
          >
            <video
              ref={videoRef}
              key={activeVideo.id}
              src={activeVideo.src}
              poster={activeVideo.poster}
              controls
              playsInline
              className="testimonial-video"
            />
            <p className="testimonial-lightbox-caption">
              {isFr
                ? `Témoignage ${activeIndex + 1} sur ${videos.length}`
                : `Testimonial ${activeIndex + 1} of ${videos.length}`}
            </p>
          </div>
          <button
            type="button"
            className="testimonial-lightbox-nav testimonial-lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label={nextLabel}
          >
            ›
          </button>
        </div>
      ) : null}
    </>
  );
}
