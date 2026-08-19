/**
 * Image URL helpers.
 *
 * Vendor media lives on Cloudinary (`res.cloudinary.com/dchqydwi2/...`) so it
 * survives Railway redeploys. The backend hands back the ORIGINAL upload — often
 * 2–4 MB — and every screen was rendering those straight into a 160px card.
 *
 * Cloudinary applies transformations from the URL path, so the fix costs one
 * string insert and no backend change: ask for the size we are actually going to
 * draw. On a mid-range Android on Pakistani mobile data this is the difference
 * between a rail that pops in and a rail that trickles.
 *
 * `f_auto` lets Cloudinary serve WebP/AVIF to clients that accept them, and
 * `q_auto` picks a quality per image rather than a fixed number. `c_fill` with
 * `g_auto` crops to the subject instead of the geometric centre — which matters
 * for wedding photography, where the face or the stage is rarely dead centre.
 *
 * Non-Cloudinary URLs (legacy local uploads, brand logos on other hosts) pass
 * through untouched, so this is always safe to call.
 */

const CLOUDINARY_UPLOAD = '/image/upload/';

/** Density to request. 2 is the right default for phone screens. */
const DPR = 2;

export interface ImgOpts {
  /** Layout width in px (pre-DPR). */
  width: number;
  /** Layout height in px (pre-DPR). Omit to scale by width and keep the ratio. */
  height?: number;
  /** Override the default subject-aware fill crop. */
  crop?: 'fill' | 'fit' | 'limit';
}

/**
 * Resize a vendor image to what will actually be drawn.
 *
 * Returns the input unchanged when it is not a Cloudinary URL, is empty, or
 * already carries a transformation (so we never stack transforms and never
 * silently re-crop an already-cropped asset).
 */
export function img(url: string | null | undefined, opts: ImgOpts): string | null {
  if (!url || typeof url !== 'string') return null;

  const at = url.indexOf(CLOUDINARY_UPLOAD);
  if (at === -1) return url;

  const head = url.slice(0, at + CLOUDINARY_UPLOAD.length);
  const tail = url.slice(at + CLOUDINARY_UPLOAD.length);

  // A transformation segment already present — leave it alone. Cloudinary
  // transform segments are comma-separated `k_v` pairs in the first path
  // segment; a version marker (`v123456`) or a plain folder is not one.
  const firstSegment = tail.split('/')[0] ?? '';
  if (/^[a-z]{1,3}_[^/]*$/.test(firstSegment) && firstSegment.includes('_')) {
    if (!/^v\d+$/.test(firstSegment)) return url;
  }

  const parts = [
    `w_${Math.round(opts.width * DPR)}`,
    opts.height ? `h_${Math.round(opts.height * DPR)}` : null,
    `c_${opts.crop ?? 'fill'}`,
    opts.height && (opts.crop ?? 'fill') === 'fill' ? 'g_auto' : null,
    'q_auto',
    'f_auto',
  ].filter(Boolean);

  return `${head}${parts.join(',')}/${tail}`;
}

/** Common sizes, so call sites don't invent their own and drift. */
export const IMG = {
  /** Arch category medallion. Taller than wide — the Mehrab aspect. */
  medallion: { width: 76, height: 96 } as ImgOpts,
  /** Vendor card in a 2-up grid or horizontal rail. */
  card: { width: 170, height: 128 } as ImgOpts,
  /** The one feature card per screen. */
  feature: { width: 360, height: 200 } as ImgOpts,
  /** Full-bleed detail hero. */
  hero: { width: 360, height: 280 } as ImgOpts,
  /** Detail gallery strip thumbnail. */
  thumb: { width: 80, height: 56 } as ImgOpts,
  /** Compare-screen column image. */
  compare: { width: 140, height: 100 } as ImgOpts,
} as const;
