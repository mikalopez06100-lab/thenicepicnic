export const homeImages = {
  hero: "/images/home/hero.jpg",
  editorialConcept: "/images/home/editorial-concept.jpg",
  bentoSetup: "/images/home/bento-setup.jpg",
  dividerPromenade: "/images/home/divider-promenade.jpg",
  spotChateau: "/images/home/spot-chateau.jpg",
  spotBoron: "/images/home/spot-boron.jpg",
  spotPromenade: "/images/home/spot-promenade.jpg",
  spotHauteurs: "/images/home/spot-hauteurs.jpg",
  spotCimiez: "/images/home/spot-cimiez.jpg",
  editorialPrestige: "/images/home/editorial-prestige.jpg",
  floatingBoatBay: "/images/home/floating-boat-bay.jpg",
  floatingBoatSunset: "/images/home/floating-boat-sunset.jpg",
  wellnessPicnic: "/images/home/wellness-picnic.jpg",
  spotFlashPoster: "/images/home/spot-flash-poster.jpg",
} as const;

export const spotFlashVideo = "/videos/spot-flash.mp4";

export const packageCardImages: Partial<
  Record<"medium" | "prestige" | "wellness" | "floating", string>
> = {
  wellness: homeImages.wellnessPicnic,
  floating: homeImages.floatingBoatBay,
};
