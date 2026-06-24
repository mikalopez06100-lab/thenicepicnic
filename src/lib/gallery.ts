import type { GalleryPhoto } from "@/lib/gallery-data";

const FEATURED_ALTS: Record<string, { fr: string; en: string }> = {
  "img-1854": {
    fr: "Deux amies profitent d'un pique-nique bohème face à la mer avec du rosé",
    en: "Two friends enjoying a bohemian picnic by the sea with rosé wine",
  },
  "img-1831": {
    fr: "Toast au rosé et planche apéro niçoise sur un pique-nique The Nice Picnic",
    en: "Rosé toast and Niçoise appetizer board at a Nice Picnic setup",
  },
  "img-2054": {
    fr: "Groupe d'amis autour d'un pique-nique bohème sous les pins",
    en: "Group of friends around a bohemian picnic under pine trees",
  },
  "img-floating-sunset": {
    fr: "Floating Picnic au coucher du soleil face à Nice",
    en: "Floating Picnic at sunset facing Nice",
  },
};

export function getGalleryPhotoAlt(
  photo: GalleryPhoto,
  locale: string,
  index?: number,
) {
  const lang = locale === "en" ? "en" : "fr";
  const specific = FEATURED_ALTS[photo.id];
  if (specific) {
    return specific[lang];
  }
  if (lang === "en") {
    return `The Nice Picnic experience on the French Riviera${index != null ? ` — photo ${index + 1}` : ""}`;
  }
  return `Expérience pique-nique The Nice Picnic sur la Côte d'Azur${index != null ? ` — photo ${index + 1}` : ""}`;
}
