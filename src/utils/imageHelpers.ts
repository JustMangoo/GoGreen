/**
 * Transform image URL for optimal thumbnail display
 * Supabase Storage supports image transformations via URL parameters
 */
export function getThumbnailUrl(
  imageUrl: string | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string {
  const fallback = "https://placehold.co/400x300";

  if (!imageUrl) return fallback;

  const { width = 400, height = 300, quality = 75 } = options;

  // Check if it's a Supabase Storage URL
  if (imageUrl.includes("supabase.co/storage")) {
    // Add transformation parameters
    const url = new URL(imageUrl);
    url.searchParams.set("width", width.toString());
    url.searchParams.set("height", height.toString());
    url.searchParams.set("quality", quality.toString());
    return url.toString();
  }

  // For external URLs, return as-is (could add other CDN transformations here)
  return imageUrl;
}

/**
 * Get full-size image URL (higher quality for detail pages)
 */
export function getFullSizeUrl(
  imageUrl: string | undefined,
  quality: number = 85
): string {
  const fallback = "https://placehold.co/400x300";

  if (!imageUrl) return fallback;

  // Check if it's a Supabase Storage URL
  if (imageUrl.includes("supabase.co/storage")) {
    const url = new URL(imageUrl);
    url.searchParams.set("quality", quality.toString());
    return url.toString();
  }

  return imageUrl;
}
