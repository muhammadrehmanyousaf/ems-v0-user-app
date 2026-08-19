/** Derive display fields from a Vendor row. Keeps card + detail DRY + consistent. */
import { formatRs } from '@/components/ui/Money';

import { backendTypeToSlug, categoryBySlug, categoryLabel } from './categories';
import { rankedImages } from './image-trust';
import type { Vendor } from './vendors.types';

/**
 * Re-exported from the single money formatter in `components/ui/Money.tsx`.
 *
 * There were briefly two implementations of this, which is how "Rs 0" gets back
 * into a product that spent effort removing it: one formatter returns
 * "On request" for a null/zero amount and the other returns "Rs 0", and whichever
 * a screen happens to import decides whether the bug appears. One formatter, one
 * contract.
 */

export { formatRs };

/**
 * Price label with the WW-PRICE0 rule: a real starting price → "From Rs X";
 * a missing/zero price → "On request" (never "Rs 0").
 *
 * "On request" rather than "Ask for a price": at 2-up on a 360px screen the card
 * is ~160px wide, and the longer string truncated to "Ask for a …", which tells
 * the customer nothing at all. Two words that always fit beat five that don't.
 */
export interface PriceLabels {
  /** `tr('price.from')` */
  from?: string;
  /** `tr('price.onRequest')` */
  onRequest?: string;
}

export function vendorPriceLabel(v: Vendor, labels: PriceLabels = {}): { text: string; onRequest: boolean } {
  const from = labels.from ?? 'From';
  const onRequest = labels.onRequest ?? 'On request';
  const p = v.minimumPrice;
  // Both halves were English literals: the "From" prefix AND the fallback. On
  // an Urdu vendor card that produced "From Rs 350,000" under a Nastaliq name,
  // and "On request" on the ~98% of listings that carry no price at all — so
  // the string a customer saw MOST often was the one that never translated.
  if (p != null && p > 0) return { text: `${from} ${formatRs(p)}`, onRequest: false };
  return { text: onRequest, onRequest: true };
}

/**
 * The same price without the "From " prefix — for cards and columns where the
 * prefix is the first thing to get cut off, taking the number with it.
 * "From Rs 350,000" truncated to "From Rs …"; "Rs 350,000" fits.
 */
export function vendorPriceCompact(v: Vendor, onRequest = 'On request'): { text: string; onRequest: boolean } {
  const p = v.minimumPrice;
  if (p != null && p > 0) return { text: formatRs(p), onRequest: false };
  return { text: onRequest, onRequest: true };
}

/**
 * A one-or-two-word category label for narrow cards. `vendorCategoryLabel`
 * returns the full singular ("Wedding Venue"), which truncates to "WEDD…" as an
 * uppercase overline in a 160px card.
 */
export function vendorCategoryShort(v: Vendor, isUrdu = false): string {
  const slug = vendorCategorySlug(v);
  const cat = slug ? categoryBySlug(slug) : undefined;
  // Falls through to the raw backend `vendorType` when the category is unknown.
  // That string is English and untranslatable here — it is a production enum
  // value, not copy — so an unmapped vendor shows its backend type rather than
  // nothing at all.
  return (cat && categoryLabel(cat, isUrdu, 'short')) || v.vendor?.vendorType || 'Vendor';
}

export function vendorLocation(v: Vendor): string {
  const parts = [v.subArea?.trim(), v.city?.trim()].filter(Boolean);
  return parts.join(', ') || (v.vendor?.city ?? '');
}

export function vendorCategorySlug(v: Vendor): string | null {
  return backendTypeToSlug(v.vendor?.vendorType);
}

export function vendorCategoryLabel(v: Vendor, isUrdu = false): string {
  const slug = vendorCategorySlug(v);
  const cat = slug ? categoryBySlug(slug) : undefined;
  return (cat && categoryLabel(cat, isUrdu, 'singular')) || v.vendor?.vendorType || 'Vendor';
}

/**
 * The best image to lead with: the vendor's own photograph if they have one,
 * otherwise platform stock, otherwise the brand logo, otherwise null (the card
 * draws the monogram).
 *
 * 86% of the images on production's most-viewed listings are platform stock
 * filed under `wedding-wala/vendors/<category>/` — a shared library keyed by
 * category, not a photograph of the business. `rankedImages` puts a vendor's own
 * uploads first, so the five listings in sixty that HAVE their own photography
 * lead with it instead of burying it behind a stock shot. See `image-trust.ts`
 * for the measurement and for why stock is not simply suppressed.
 */
export function vendorPrimaryImage(v: Vendor): string | null {
  const ranked = rankedImages(v);
  if (ranked.length > 0) return ranked[0];
  return v.brandLogo ?? null;
}

/**
 * The gallery, **best-first**: the vendor's own uploads, then unshared stock,
 * then everything else.
 *
 * It used to return `v.images` in raw backend order, which is why the strip
 * under the hero on vendor 3358 opened with a Wedding Wala office render and an
 * `aiondigital.com` logo — those are literally `images[0]` and `images[1]`.
 * Nothing in the API says which photograph is of the business, but the Cloudinary
 * PATH does say which were uploaded by the vendor (`businesses/<id>/`) versus
 * pulled from the shared category stock library (`vendors/<category>/`), and 86%
 * of images across the top 60 listings are the latter.
 *
 * Ordering rather than deleting: a couple flicking through a gallery should meet
 * the real photographs first, but a listing whose entire gallery is stock still
 * has something to show. See `image-trust.ts` for the measurement.
 */
export function vendorGallery(v: Vendor): string[] {
  const ranked = rankedImages(v);
  return ranked.length > 0 ? ranked : v.brandLogo ? [v.brandLogo] : [];
}

export function isVerified(v: Vendor): boolean {
  return (v.verificationTier ?? 0) > 0;
}
