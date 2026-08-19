/**
 * image-trust — tell a vendor's own photograph apart from platform stock.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE MEASUREMENT (and a correction to an earlier one)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Blocker B2 recorded that vendor galleries contain platform adverts and
 * unrelated stock. It was qualitative until the S1 pass counted it — and the
 * first count was wrong, so both numbers are recorded here.
 *
 * **The wrong measurement.** Sixty businesses (the first ten in each of the six
 * categories Home shows) were scanned for repeated images, keyed by FILENAME.
 * That reported 69 of 125 images — 55% — shared across businesses. It was an
 * artefact: `vendors/catering/05.jpg` and `vendors/decor/05.jpg` share a
 * basename and are different pictures. Keyed by filename the finding was
 * inflated; keyed by URL the app's filter then caught almost nothing, which is
 * how the error surfaced — the fix visibly did nothing on screen.
 *
 * **The right measurement.** Cloudinary paths carry the answer directly. There
 * are two kinds of image URL on this platform:
 *
 *   wedding-wala/businesses/<id>/images/<random>   a vendor's own upload
 *   wedding-wala/vendors/<category>/<nn>.jpg       a platform stock pack
 *
 * The second is a shared library, keyed by CATEGORY not by business. Across
 * those same sixty businesses:
 *
 *   • **270 of 314 images (86%) are platform stock**, not vendor uploads.
 *   • **54 of 60 businesses lead with a stock image.** Five lead with a real
 *     photograph of themselves. One has no image at all.
 *   • 53 exact URLs are additionally attached to more than one business —
 *     e.g. `vendors/photographer/07.jpg` on both 2523 and 2514.
 *
 * So nearly every vendor card in the app is presenting a generic category photo
 * as that business's premises. rules.md §6 forbids exactly this: *"Never a
 * stranger's photo presented as theirs."*
 *
 * ── What this module does, and deliberately does not do ───────────────────
 *
 * Enforcing §6 literally would blank 54 of 60 cards on Home — a wall of
 * monograms. That is arguably the correct reading of the rule, and it is far too
 * large a product change to make inside a screen slice. It is the founder's call
 * and it is written up in 00-PROGRAM.md as B2.
 *
 * What ships now is the part that is unambiguously an improvement and cannot
 * make any card worse:
 *
 *   1. **Prefer a vendor's own photograph** whenever they have one. Today that
 *      promotes five listings from stock to their real premises, and it improves
 *      automatically as vendors upload.
 *   2. **Never show stock where the image is a claim.** `vendorHasOwnPhotography`
 *      lets the featured slot and the detail hero require a real upload rather
 *      than amplifying a category photo to full width.
 *   3. Fall back to stock rather than to nothing, so no card regresses while the
 *      product decision is open.
 */
import type { Vendor } from './vendors.types';

/**
 * Platform stock: an image filed under the shared `vendors/<category>/` library
 * instead of the business's own `businesses/<id>/` folder. This is a structural
 * fact about where the file lives, not a guess about what is in it.
 */
export function isPlatformStock(url: string): boolean {
  return /\/wedding-wala\/vendors\//.test(url);
}

/** A vendor's own upload — filed under their business folder. */
export function isOwnUpload(url: string): boolean {
  return /\/wedding-wala\/businesses\/\d+\//.test(url);
}

/** image URL → the business IDs claiming it. Exact URLs only. */
const owners = new Map<string, Set<number>>();

/**
 * Feed every vendor list through here. Called from `listBusinesses`, the single
 * choke point every listing passes.
 *
 * The duplicate index is a secondary signal — 53 exact URLs really are attached
 * to more than one business — but it is weaker than the path test and it only
 * knows what has been fetched, so it is used to BREAK TIES between two stock
 * images, never to blank a card on its own.
 *
 * Safe to call from a query function: it runs outside the render phase, so this
 * is never a setState-during-render (rules.md prohibition 7).
 */
export function recordVendorImages(vendors: Pick<Vendor, 'id' | 'images'>[]): void {
  for (const v of vendors) {
    if (!Array.isArray(v.images)) continue;
    for (const url of v.images) {
      if (typeof url !== 'string' || !url) continue;
      let set = owners.get(url);
      if (!set) {
        set = new Set();
        owners.set(url, set);
      }
      set.add(v.id);
    }
  }
}

/** True only when this exact URL has been observed on a DIFFERENT business. */
export function isSharedImage(url: string): boolean {
  return (owners.get(url)?.size ?? 0) > 1;
}

/**
 * Does this vendor have at least one photograph of their own?
 *
 * The gate for any surface where the image is a CLAIM about the business — the
 * featured slot on Home, the full-bleed hero on detail. Five of sixty pass today.
 */
export function vendorHasOwnPhotography(v: Pick<Vendor, 'images'>): boolean {
  return Array.isArray(v.images) && v.images.some((u) => typeof u === 'string' && isOwnUpload(u));
}

/**
 * Rank a vendor's images best-first: their own uploads, then unshared stock,
 * then everything else. Used for the primary image and, later, gallery order.
 */
export function rankedImages(v: Pick<Vendor, 'images'>): string[] {
  const imgs = (Array.isArray(v.images) ? v.images : []).filter(
    (u): u is string => typeof u === 'string' && u.length > 0,
  );
  return [
    ...imgs.filter((u) => isOwnUpload(u)),
    ...imgs.filter((u) => !isOwnUpload(u) && !isSharedImage(u)),
    ...imgs.filter((u) => !isOwnUpload(u) && isSharedImage(u)),
  ];
}

/** Diagnostics for the program doc — not used by any screen. */
export function imageTrustStats(): { tracked: number; shared: number } {
  let shared = 0;
  for (const set of owners.values()) if (set.size > 1) shared += 1;
  return { tracked: owners.size, shared };
}
