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

  // AVIF maintains detail better at lower quality settings than JPEG
  const { width = 400, height = 300, quality = 50 } = options;

  // Check if it's a Supabase Storage URL
  if (imageUrl.includes("supabase.co/storage")) {
    const url = new URL(imageUrl);
    
    // Add transformation parameters
    url.searchParams.set("width", width.toString());
    url.searchParams.set("height", height.toString());
    url.searchParams.set("quality", quality.toString());
    
    //Force AVIF format for superior compression (LCP optimization)
    url.searchParams.set("format", "avif");
    
    // Ensure we resize to cover the dimensions (prevents distortion)
    url.searchParams.set("resize", "cover");
    
    return url.toString();
  }

  // For external URLs, return as-is
  return imageUrl;
}

/**
 * Get low-quality image placeholder for blur-up effect (LQIP)
 * Generates a tiny, heavily compressed version for fast loading
 */
export function getLQIPUrl(
  imageUrl: string | undefined,
  options: {
    width?: number;
    height?: number;
  } = {}
): string {
  if (!imageUrl) return "";

  const { width = 20, height = 9 } = options;

  if (imageUrl.includes("supabase.co/storage")) {
    const url = new URL(imageUrl);
    url.searchParams.set("width", width.toString());
    url.searchParams.set("height", height.toString());
    // AVIF at quality 10 is very small but still recognizable as a blur
    url.searchParams.set("quality", "10"); 
    url.searchParams.set("format", "avif"); 
    return url.toString();
  }

  return "";
}

/**
 * Get full-size image URL (higher quality for detail pages)
 */
export function getFullSizeUrl(
  imageUrl: string | undefined,
  quality: number = 80
): string {
  const fallback = "https://placehold.co/400x300";

  if (!imageUrl) return fallback;

  if (imageUrl.includes("supabase.co/storage")) {
    const url = new URL(imageUrl);
    url.searchParams.set("quality", quality.toString());
    url.searchParams.set("format", "avif");
    return url.toString();
  }

  return imageUrl;
}