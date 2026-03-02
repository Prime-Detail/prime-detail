import fs from 'node:fs/promises';
import path from 'node:path';

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const query = process.env.GOOGLE_PLACES_TEXT_QUERY || 'Prime Detail Caen';
const outputFile = path.resolve(process.cwd(), 'astro', 'src', 'data', 'google-reviews.json');

if (!apiKey) {
  console.error('Missing GOOGLE_PLACES_API_KEY');
  process.exit(1);
}

async function searchPlaceId() {
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.googleMapsUri,places.formattedAddress'
    },
    body: JSON.stringify({ textQuery: query, languageCode: 'fr' })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`searchText failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const place = data?.places?.[0];

  if (!place?.id) {
    throw new Error(`No place found for query: ${query}`);
  }

  return {
    id: place.id,
    fallbackName: place?.displayName?.text || 'Prime Detail',
    fallbackMapsUri: place?.googleMapsUri || null
  };
}

async function fetchPlaceDetails(placeId) {
  const fieldMask = [
    'id',
    'displayName',
    'googleMapsUri',
    'rating',
    'userRatingCount',
    'reviews'
  ].join(',');

  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`place details failed (${response.status}): ${body}`);
  }

  return response.json();
}

function normalize(data, fallback) {
  const reviews = (data.reviews || []).map((review) => ({
    rating: review.rating ?? null,
    text: review.text?.text || review.originalText?.text || '',
    relativeTime: review.relativePublishTimeDescription || null,
    publishTime: review.publishTime || null,
    authorName: review.authorAttribution?.displayName || 'Client Google',
    authorUri: review.authorAttribution?.uri || null,
    authorPhotoUri: review.authorAttribution?.photoUri || null
  }));

  return {
    updatedAt: new Date().toISOString(),
    businessName: data.displayName?.text || fallback.fallbackName || 'Prime Detail',
    googleMapsUri: data.googleMapsUri || fallback.fallbackMapsUri || null,
    rating: typeof data.rating === 'number' ? data.rating : null,
    userRatingCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
    reviews
  };
}

async function main() {
  const place = await searchPlaceId();
  const details = await fetchPlaceDetails(place.id);
  const normalized = normalize(details, place);

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(normalized, null, 2) + '\n', 'utf-8');

  console.log(`Updated ${outputFile}`);
  console.log(`Place: ${normalized.businessName}`);
  console.log(`Reviews: ${normalized.reviews.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
