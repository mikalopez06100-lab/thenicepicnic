"use client";

type Props = {
  src: string;
  poster: string;
  label: string;
  caption: string;
};

export function SpotFlashVideo({ src, poster, label, caption }: Props) {
  return (
    <div className="spot-flash-bar">
      <div className="spot-flash-clip">
        <video
          src={src}
          poster={poster}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-label={label}
        />
      </div>
      <p className="spot-flash-caption">{caption}</p>
    </div>
  );
}
