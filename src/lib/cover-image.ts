const FALLBACK_COVER_URL =
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80';

/**
 * Return a displayable remote cover URL. Seed data uses example.com URLs,
 * which are documentation placeholders rather than image files.
 */
export function getCoverUrl(coverUrl?: string | null): string {
  const value = coverUrl?.trim();

  if (!value) return FALLBACK_COVER_URL;

  try {
    const url = new URL(value);
    // Gỡ bỏ đoạn check url.hostname !== 'example.com'
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return value;
    }
  } catch {
    // ...
  }

  return FALLBACK_COVER_URL;
}
