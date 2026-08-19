/**
 * Cover imagery for the arch medallions.
 *
 * The medallions need a photograph per category. Hardcoding Cloudinary paths
 * would be brittle (the pool is curated by ops, not by us) and would silently
 * break the day an asset is renamed. So we ask the API for the top vendor in each
 * category and use its first image — real data, improving on its own as vendors
 * upload better photography.
 *
 * ── The N+1 that was hiding in the old version ────────────────────────────
 *
 * This hook used to fetch `limit: 1` under its own `['vendors','cover',slug]`
 * key, and its comment claimed "the same query keys are reused by the rails, so a
 * category that appears in both is fetched once". That was simply untrue: the
 * rails use `['vendors','byCategory',slug,10]`. Different key, different cache
 * entry, second request to the same endpoint for a subset of the same rows.
 *
 * Home paid for it twelve times over on a cold start: 6 cover requests + 4 rail
 * requests + 1 spotlight request (which asked for `limit: 12`, a third distinct
 * key for the venues list) + platform stats. On a Lahore 3G connection that is
 * twelve round trips before the screen settles.
 *
 * Now every consumer on Home — covers, rails, spotlight — goes through
 * `useVendorsByCategory(slug, 10)`. Identical key, one cache entry, one request
 * per category. **12 requests → 7**, and each of the 7 is a request the screen
 * needed anyway. The covers get 10 rows instead of 1, which costs a few KB and
 * saves a whole round trip; and because the rail has already warmed the cache,
 * a medallion usually renders from memory.
 */
import { useQueries } from '@tanstack/react-query';

import { categoryBySlug } from '@/features/vendors/categories';
import { vendorPrimaryImage } from '@/features/vendors/vendor-display';
import { listBusinesses } from '@/lib/api/endpoints/vendors';

/** Must match `useVendorsByCategory`'s limit, or the keys diverge again. */
const SHARED_LIMIT = 10;

/** slug → first usable image URL (or null while loading / when none exists). */
export function useCategoryCovers(slugs: string[]): Record<string, string | null> {
  const results = useQueries({
    queries: slugs.map((slug) => {
      const backendType = categoryBySlug(slug)?.backendType ?? null;
      return {
        // Byte-identical to `useVendorsByCategory(slug, 10)`. Do not "optimise"
        // this to limit:1 — that is what created the duplicate request.
        queryKey: ['vendors', 'byCategory', slug, SHARED_LIMIT] as const,
        queryFn: () => listBusinesses({ vendorType: backendType, limit: SHARED_LIMIT, page: 1 }),
        enabled: backendType !== null,
        staleTime: 10 * 60 * 1000,
        retry: 1,
      };
    }),
  });

  const covers: Record<string, string | null> = {};
  slugs.forEach((slug, i) => {
    // First vendor that actually has an image, not simply the first vendor —
    // ~98% of listings are unclaimed OSM imports and many carry none at all, so
    // taking [0] blind leaves the medallion permanently on its sand fallback.
    const list = results[i]?.data?.vendors ?? [];
    const withImage = list.find((v) => !!vendorPrimaryImage(v));
    covers[slug] = withImage ? vendorPrimaryImage(withImage) : null;
  });
  return covers;
}
