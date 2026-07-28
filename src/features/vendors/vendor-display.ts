/** Derive display fields from a Vendor row. Keeps card + detail DRY + consistent. */
import { backendTypeToSlug, categoryBySlug } from './categories';
import type { Vendor } from './vendors.types';

/** "Rs 85,000" (no decimals). */
export function formatRs(n: number): string {
  return `Rs ${Math.round(n).toLocaleString('en-PK')}`;
}

/**
 * Price label with the WW-PRICE0 rule: a real starting price → "From Rs X";
 * a missing/zero price → "Ask for a price" (never "Rs 0").
 */
export function vendorPriceLabel(v: Vendor): { text: string; onRequest: boolean } {
  const p = v.minimumPrice;
  if (p != null && p > 0) return { text: `From ${formatRs(p)}`, onRequest: false };
  return { text: 'Ask for a price', onRequest: true };
}

export function vendorLocation(v: Vendor): string {
  const parts = [v.subArea?.trim(), v.city?.trim()].filter(Boolean);
  return parts.join(', ') || (v.vendor?.city ?? '');
}

export function vendorCategorySlug(v: Vendor): string | null {
  return backendTypeToSlug(v.vendor?.vendorType);
}

export function vendorCategoryLabel(v: Vendor): string {
  const slug = vendorCategorySlug(v);
  const cat = slug ? categoryBySlug(slug) : undefined;
  return cat?.singular ?? v.vendor?.vendorType ?? 'Vendor';
}

/** First usable image URL, or the brand logo, or null (card shows a fallback). */
export function vendorPrimaryImage(v: Vendor): string | null {
  if (Array.isArray(v.images) && v.images.length > 0) {
    const first = v.images.find((u) => typeof u === 'string' && u.length > 0);
    if (first) return first;
  }
  return v.brandLogo ?? null;
}

export function vendorGallery(v: Vendor): string[] {
  const imgs = Array.isArray(v.images) ? v.images.filter((u) => typeof u === 'string' && u.length > 0) : [];
  return imgs.length > 0 ? imgs : v.brandLogo ? [v.brandLogo] : [];
}

export function isVerified(v: Vendor): boolean {
  return (v.verificationTier ?? 0) > 0;
}
