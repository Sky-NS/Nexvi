import { Trip } from '@/types/trip';

const STOPWORDS = new Set([
  'и', 'в', 'на', 'у', 'к', 'с', 'по', 'до', 'от', 'из', 'для', 'о', 'об', 'это', 'как',
  'the', 'a', 'an', 'of', 'and', 'in', 'at', 'to', 'de', 'la', 'le', 'el',
]);

function significantWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[«»"'".,()!?:;\-–—]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Independent sanity check on top of the intitle: search: does the matched
// article's title actually share a meaningful word with what we searched
// for? This is what catches cases where Wikipedia's search returns a
// technically-ranked-top-result that isn't really about the same thing.
function looksRelevant(query: string, resultTitle: string): boolean {
  const queryWords = significantWords(query);
  if (queryWords.length === 0) return false;
  const titleWords = new Set(significantWords(resultTitle));
  return queryWords.some((w) => titleWords.has(w));
}

interface WikiMatch { title: string; thumbnail: string | null; }

async function searchWikipediaTitle(query: string, language: string): Promise<WikiMatch | null> {
  // intitle: restricts results to pages whose TITLE contains the search
  // term, instead of any page that merely mentions it in the body text —
  // much closer to "is there an article about this place" than a plain
  // full-text search, which tended to surface loosely-related pages.
  const url = `https://${language}.wikipedia.org/w/api.php` +
    `?action=query&generator=search&gsrsearch=${encodeURIComponent('intitle:' + query)}` +
    `&gsrlimit=1&gsrnamespace=0&prop=pageimages&piprop=thumbnail&pithumbsize=800&format=json&origin=*`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  const page: any = Object.values(pages)[0];
  if (!page?.title) return null;
  return { title: page.title, thumbnail: page.thumbnail?.source || null };
}

export async function fetchWikipediaThumbnail(query: string, language: string): Promise<string | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const match = await searchWikipediaTitle(q, language);
    if (!match || !match.thumbnail) return null;
    if (!looksRelevant(q, match.title)) return null;
    return match.thumbnail;
  } catch {
    return null;
  }
}

// Mutates and returns the same trip: for every activity without a photo
// already, tries to find a matching Wikipedia article (by location, falling
// back to the activity title) and attaches its thumbnail. Two activities
// never end up sharing the same photo — the first lookup to resolve with a
// given image "claims" it, so anything that would otherwise repeat that
// same image is left empty instead of visually duplicated.
export async function attachWikipediaPhotos(trip: Trip, language: string): Promise<Trip> {
  const usedPhotos = new Set<string>();
  const lookups: Promise<void>[] = [];

  for (const day of trip.days) {
    for (const activity of day.activities) {
      if (activity.photo) continue;
      const query = (activity.location || activity.title || '').trim();
      if (!query) continue;
      lookups.push(
        fetchWikipediaThumbnail(query, language).then((url) => {
          if (url && !usedPhotos.has(url)) {
            usedPhotos.add(url);
            activity.photo = url;
          }
        })
      );
    }
  }

  await Promise.allSettled(lookups);
  return trip;
}
