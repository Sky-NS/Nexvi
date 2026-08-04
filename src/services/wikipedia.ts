import { Trip } from '@/types/trip';

// Wikipedia's action API supports anonymous, keyless, CORS-enabled requests
// from the browser via origin=*. generator=search + prop=pageimages lets us
// do "find the best-matching article, and its thumbnail if it has one" in a
// single round trip instead of a search call followed by a details call.
export async function fetchWikipediaThumbnail(query: string, language: string): Promise<string | null> {
  const q = query.trim();
  if (!q) return null;

  const url = `https://${language}.wikipedia.org/w/api.php` +
    `?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}` +
    `&gsrlimit=1&gsrnamespace=0&prop=pageimages&piprop=thumbnail&pithumbsize=800&format=json&origin=*`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    const page: any = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

// Mutates and returns the same trip: for every activity, tries to find a
// matching Wikipedia page (searching by location, falling back to the
// activity title) and attaches its thumbnail as the activity's photo.
// Activities with no match, or that already have a photo, are left as-is.
// Failures are swallowed per-activity so one bad lookup (or Wikipedia being
// briefly unreachable) never breaks trip generation.
export async function attachWikipediaPhotos(trip: Trip, language: string): Promise<Trip> {
  const lookups: Promise<void>[] = [];

  for (const day of trip.days) {
    for (const activity of day.activities) {
      if (activity.photo) continue;
      const query = (activity.location || activity.title || '').trim();
      if (!query) continue;
      lookups.push(
        fetchWikipediaThumbnail(query, language).then((url) => {
          if (url) activity.photo = url;
        })
      );
    }
  }

  await Promise.allSettled(lookups);
  return trip;
}
