export const BOOKABLE_PACKAGES = [
  "medium",
  "prestige",
  "wellness",
  "floating",
] as const;

export const LEGACY_PACKAGES = ["kit", "kit_food"] as const;

export type BookablePackage = (typeof BOOKABLE_PACKAGES)[number];
export type LegacyPackage = (typeof LEGACY_PACKAGES)[number];
export type ReservationPackage = BookablePackage | LegacyPackage;

export type PackageCatalogEntry = {
  unitAmount: number;
  popular?: boolean;
  premium?: boolean;
  maxGuests?: number;
};

export const PACKAGE_CATALOG: Record<BookablePackage, PackageCatalogEntry> = {
  medium: { unitAmount: 59, popular: true },
  prestige: { unitAmount: 79, premium: true },
  wellness: { unitAmount: 39 },
  floating: { unitAmount: 89, maxGuests: 2 },
};

const BOOKABLE_LABELS: Record<
  BookablePackage,
  { fr: { name: string; mode: string }; en: { name: string; mode: string } }
> = {
  medium: {
    fr: { name: "Medium", mode: "installé pour vous" },
    en: { name: "Medium", mode: "set up for you" },
  },
  prestige: {
    fr: { name: "Premium", mode: "expérience raffinée" },
    en: { name: "Premium", mode: "refined experience" },
  },
  wellness: {
    fr: { name: "Wellness Picnic", mode: "bien-être en plein air" },
    en: { name: "Wellness Picnic", mode: "outdoor wellness" },
  },
  floating: {
    fr: { name: "Floating Picnic", mode: "sur l'eau" },
    en: { name: "Floating Picnic", mode: "on the water" },
  },
};

const LEGACY_LABELS: Record<LegacyPackage, string> = {
  kit: "Le Kit",
  kit_food: "Le Kit + food",
};

export function isBookablePackage(value: string): value is BookablePackage {
  return (BOOKABLE_PACKAGES as readonly string[]).includes(value);
}

export function isReservationPackage(value: string): value is ReservationPackage {
  return isBookablePackage(value) || (LEGACY_PACKAGES as readonly string[]).includes(value);
}

export function getBookablePackageLabel(
  slug: BookablePackage,
  locale: "fr" | "en",
): string {
  return BOOKABLE_LABELS[slug][locale].name;
}

export function getPackageLabel(packageType: ReservationPackage): string {
  if ((LEGACY_PACKAGES as readonly string[]).includes(packageType)) {
    return LEGACY_LABELS[packageType as LegacyPackage];
  }
  return BOOKABLE_LABELS[packageType as BookablePackage].fr.name;
}

export function formatPackagePrice(amount: number, locale: string): string {
  const hasDecimals = amount % 1 !== 0;
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(amount);
}

export function formatPackageHint(
  slug: BookablePackage,
  locale: "fr" | "en",
): string {
  const amount = PACKAGE_CATALOG[slug].unitAmount;
  const price = formatPackagePrice(amount, locale);
  return locale === "fr" ? `${price} / pers` : `${price} / person`;
}
