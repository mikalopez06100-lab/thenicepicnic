/**
 * Trouve le Place ID Google à partir d'une recherche texte.
 * Usage : node scripts/find-google-place-id.mjs "The Nice Picnic Nice"
 */
const query = process.argv.slice(2).join(" ") || "The Nice Picnic Nice";
const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

if (!apiKey) {
  console.error("Définissez GOOGLE_PLACES_API_KEY dans l'environnement.");
  process.exit(1);
}

const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,googleMapsUri",
  },
  body: JSON.stringify({
    textQuery: query,
    languageCode: "fr",
    regionCode: "FR",
    maxResultCount: 5,
  }),
});

const data = await response.json();
if (!response.ok) {
  console.error("Erreur API", response.status, JSON.stringify(data, null, 2));
  process.exit(1);
}

const places = data.places ?? [];
if (places.length === 0) {
  console.log("Aucun résultat pour:", query);
  process.exit(0);
}

for (const place of places) {
  console.log("—".repeat(50));
  console.log("Nom:", place.displayName?.text);
  console.log("Adresse:", place.formattedAddress);
  console.log("Note:", place.rating, `(${place.userRatingCount ?? 0} avis)`);
  console.log("GOOGLE_PLACE_ID=", place.id);
}
