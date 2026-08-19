/** Client-side vendor filtering + sorting (mirrors the web's approach). */
import { isVerified, vendorLocation } from '@/features/vendors/vendor-display';
import type { Vendor } from '@/features/vendors/vendors.types';

export type SortKey = 'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'name' | 'recent';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'A–Z' },
  { value: 'recent', label: 'Most recent' },
];

export interface ExploreFilters {
  city: string | null;
  minPrice: number;
  maxPrice: number; // PRICE_MAX = no cap
  minRating: number; // 0 = any
  verifiedOnly: boolean;
  featuredOnly: boolean;
  availableOnly: boolean; // not on vacation
  minCapacity: number; // 0 = any
  amenities: string[];
  sort: SortKey;
}

export const PRICE_MAX = 1_000_000;

export const DEFAULT_FILTERS: ExploreFilters = {
  city: null,
  minPrice: 0,
  maxPrice: PRICE_MAX,
  minRating: 0,
  verifiedOnly: false,
  featuredOnly: false,
  availableOnly: false,
  minCapacity: 0,
  amenities: [],
  sort: 'relevance',
};

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  if (typeof v === 'string' && v) return [v];
  return [];
}

/** Count non-default filters (for the "Filters (N)" badge). Sort excluded. */
export function countActiveFilters(f: ExploreFilters): number {
  let n = 0;
  if (f.city) n += 1;
  if (f.minPrice > 0) n += 1;
  if (f.maxPrice < PRICE_MAX) n += 1;
  if (f.minRating > 0) n += 1;
  if (f.verifiedOnly) n += 1;
  if (f.featuredOnly) n += 1;
  if (f.availableOnly) n += 1;
  if (f.minCapacity > 0) n += 1;
  n += f.amenities.length;
  return n;
}

export function hasActiveFilters(f: ExploreFilters): boolean {
  return countActiveFilters(f) > 0 || f.sort !== 'relevance';
}

/** Cities + amenities present in the current result set, for dynamic chips. */
export interface ExploreFacets {
  cities: string[];
  amenities: string[];
  /**
   * Every vendor's starting price, INCLUDING the nulls.
   *
   * The nulls are the point. `PriceHistogram` counts them to state how much of
   * the catalogue a price filter silently excludes, and at ~98% unpriced that
   * sentence is the most important thing on the filter sheet. Stripping them
   * here would turn an honest chart into a flattering one.
   */
  prices: (number | null | undefined)[];
}

export function deriveFacets(vendors: Vendor[]): ExploreFacets {
  const cities = new Set<string>();
  const amenities = new Set<string>();
  // One pass that already walks every vendor — the distribution is free, which
  // is why the histogram was worth building for us before it was for anyone we
  // copied it from.
  const prices: (number | null | undefined)[] = [];
  for (const v of vendors) {
    const c = (v.city ?? v.vendor?.city ?? '').trim();
    if (c) cities.add(c);
    for (const a of toArray(v.amenities)) amenities.add(a);
    prices.push(v.minimumPrice);
  }
  return {
    cities: [...cities].sort((a, b) => a.localeCompare(b)),
    amenities: [...amenities].sort((a, b) => a.localeCompare(b)).slice(0, 40),
    prices,
  };
}

export function applyVendorFilters(vendors: Vendor[], f: ExploreFilters, search: string): Vendor[] {
  const s = search.trim().toLowerCase();
  const filtered = vendors.filter((v) => {
    if (s) {
      const hay = `${v.name} ${vendorLocation(v)} ${v.vendor?.vendorType ?? ''}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    if (f.city && (v.city ?? v.vendor?.city ?? '').trim() !== f.city) return false;
    const price = v.minimumPrice ?? 0;
    if (f.minPrice > 0 && price < f.minPrice) return false;
    if (f.maxPrice < PRICE_MAX && price > 0 && price > f.maxPrice) return false;
    if (f.minRating > 0 && v.rating < f.minRating) return false;
    if (f.verifiedOnly && !isVerified(v)) return false;
    if (f.featuredOnly && !v.sponsored) return false;
    if (f.availableOnly && v.vacationMode) return false;
    if (f.minCapacity > 0 && (v.maxCapacity ?? 0) < f.minCapacity) return false;
    if (f.amenities.length > 0) {
      const have = new Set(toArray(v.amenities).map((a) => a.toLowerCase()));
      if (!f.amenities.every((a) => have.has(a.toLowerCase()))) return false;
    }
    return true;
  });
  return sortVendors(filtered, f.sort);
}

export function sortVendors(vendors: Vendor[], sort: SortKey): Vendor[] {
  const out = [...vendors];
  switch (sort) {
    case 'rating':
      return out.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'price_asc':
      return out.sort((a, b) => (a.minimumPrice ?? Infinity) - (b.minimumPrice ?? Infinity));
    case 'price_desc':
      return out.sort((a, b) => (b.minimumPrice ?? 0) - (a.minimumPrice ?? 0));
    case 'name':
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case 'recent':
      return out.sort((a, b) => Number(b.id) - Number(a.id));
    case 'relevance':
    default:
      // Featured first, then rating, then review volume — the web's default feel.
      return out.sort(
        (a, b) =>
          Number(b.sponsored) - Number(a.sponsored) ||
          b.rating - a.rating ||
          b.reviewCount - a.reviewCount,
      );
  }
}
