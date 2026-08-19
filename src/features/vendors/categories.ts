/**
 * Vendor categories — ported verbatim from the web (ems-v0 lib/seo/constants.ts):
 * the SAME slugs, singular/plural labels, backend `vendorType` map, and fold
 * aliases. Single source of truth for browse + filtering. Icons added for the
 * app's category grid.
 */
import type Ionicons from '@expo/vector-icons/Ionicons';

type IconName = keyof typeof Ionicons.glyphMap;

export interface VendorCategory {
  slug: string;
  singular: string;
  plural: string;
  description: string;
  /** Backend `User.vendorType` enum value, or null if no backend type yet. */
  backendType: string | null;
  icon: IconName;
  /**
   * A one-or-two-word label for tight spaces — the arch medallions are ~76px
   * wide at 360px, where "Wedding Photographers" truncates to
   * "Wedding Photograp…". Falls back to `plural` when absent.
   */
  short?: string;
}

export const CATEGORIES: VendorCategory[] = [
  { slug: 'wedding-venues', short: 'Venues', singular: 'Wedding Venue', plural: 'Wedding Venues', backendType: 'Wedding venue', icon: 'business-outline', description: 'Banquet halls, marquees, lawns, hotels, farmhouses for the barat, walima, and mehndi.' },
  { slug: 'wedding-photographers', short: 'Photo', singular: 'Wedding Photographer', plural: 'Wedding Photographers', backendType: 'Photographer', icon: 'camera-outline', description: 'Photographers and cinematographers capturing every shaadi function.' },
  { slug: 'caterers', short: 'Catering', singular: 'Caterer', plural: 'Caterers', backendType: 'Catering', icon: 'restaurant-outline', description: 'Wedding caterers serving Pakistani, continental, BBQ, and fusion menus.' },
  { slug: 'wedding-decorators', short: 'Décor', singular: 'Wedding Decorator', plural: 'Wedding Decorators', backendType: 'Decorator', icon: 'flower-outline', description: 'Stage, mandap, and entrance decor — traditional through modern.' },
  { slug: 'mehndi-artists', short: 'Mehndi', singular: 'Mehndi Artist', plural: 'Mehndi Artists', backendType: 'Henna artist', icon: 'hand-left-outline', description: 'Bridal mehndi designers — Indian, Arabic, Pakistani, and Moroccan styles.' },
  { slug: 'bridal-makeup-artists', short: 'Makeup', singular: 'Bridal Makeup Artist', plural: 'Bridal Makeup Artists', backendType: 'Makeup artist', icon: 'brush-outline', description: 'Bridal makeup, hair, and grooming for every wedding function.' },
  { slug: 'bridal-wear', short: 'Bridal Wear', singular: 'Bridal Wear', plural: 'Bridal Wear', backendType: 'Bridal wearing', icon: 'shirt-outline', description: 'Designer lehengas, ghararas, and wedding outfits — ready-made and bespoke.' },
  { slug: 'wedding-cars', short: 'Cars', singular: 'Wedding Car', plural: 'Wedding Cars', backendType: 'Car rental', icon: 'car-sport-outline', description: 'Decorated cars and luxury rentals for the rukhsati.' },
  { slug: 'wedding-stationery', short: 'Cards', singular: 'Wedding Stationery', plural: 'Wedding Stationery', backendType: 'Wedding Invitations and Stationery', icon: 'mail-outline', description: 'Invitation cards, save-the-dates, and bespoke wedding stationery.' },
  { slug: 'wedding-djs', short: 'Music', singular: 'Wedding DJ', plural: 'Wedding DJs', backendType: 'Dhol player', icon: 'musical-notes-outline', description: 'DJs, dholis, qawwals, and live performers for every wedding function.' },
  { slug: 'wedding-mithai', short: 'Mithai', singular: 'Mithai & Sweets Shop', plural: 'Mithai & Sweets', backendType: 'Mithai and sweets', icon: 'ice-cream-outline', description: 'Traditional mithai, barfi, ladoo, and wedding sweets.' },
  { slug: 'nikah-khwan', short: 'Nikah', singular: 'Nikah Khwan', plural: 'Nikah Khwans', backendType: 'Nikahkhwan', icon: 'book-outline', description: 'Nikah khwans and officiants to solemnise your nikah ceremony.' },
  { slug: 'wedding-generators', short: 'Generators', singular: 'Generator Rental', plural: 'Generator Rentals', backendType: 'Generator rental', icon: 'flash-outline', description: 'Backup power and generator rentals for every wedding function.' },
  { slug: 'wedding-cake-designers', short: 'Cakes', singular: 'Wedding Cake Designer', plural: 'Wedding Cake Designers', backendType: 'Wedding cakes', icon: 'gift-outline', description: 'Custom wedding cakes and dessert tables for the big day.' },
  { slug: 'wedding-planners', short: 'Planners', singular: 'Wedding Planner', plural: 'Wedding Planners', backendType: null, icon: 'clipboard-outline', description: 'Full-service event planners coordinating every detail end-to-end.' },
];

/**
 * ── Urdu category labels ──────────────────────────────────────────────────
 *
 * The table above is ported verbatim from the web's SEO constants, so `slug`,
 * `backendType` and the English labels are that file's business and are not
 * touched here: the slug routes, the backend type matches rows in production,
 * and both must stay byte-identical to the web.
 *
 * What was missing is anything to SHOW an Urdu customer. Explore's category
 * rail — the primary navigation of the browse tab — rendered
 * "Wedding Venue / Wedding Photographer / Caterer" in Latin on a screen where
 * the title, the search field, the filter button and all five tabs were Urdu.
 * The home arch row and the vendor detail overline had it too.
 *
 * Keyed by slug rather than added as fields on `VendorCategory` so the ported
 * table stays a clean copy of the web's and the next port does not conflict.
 */
interface UrduCategoryLabel {
  singular: string;
  plural: string;
  short: string;
}

const URDU_LABELS: Record<string, UrduCategoryLabel> = {
  'wedding-venues': { singular: 'شادی ہال', plural: 'شادی ہال', short: 'ہال' },
  'wedding-photographers': { singular: 'فوٹوگرافر', plural: 'فوٹوگرافرز', short: 'فوٹو' },
  caterers: { singular: 'کیٹرر', plural: 'کیٹررز', short: 'کیٹرنگ' },
  'wedding-decorators': { singular: 'ڈیکوریٹر', plural: 'ڈیکوریٹرز', short: 'ڈیکور' },
  'mehndi-artists': { singular: 'مہندی آرٹسٹ', plural: 'مہندی آرٹسٹس', short: 'مہندی' },
  'bridal-makeup-artists': { singular: 'میک اپ آرٹسٹ', plural: 'میک اپ آرٹسٹس', short: 'میک اپ' },
  'bridal-wear': { singular: 'دلہن کا لباس', plural: 'دلہن کا لباس', short: 'لباس' },
  'wedding-cars': { singular: 'شادی کی گاڑی', plural: 'شادی کی گاڑیاں', short: 'گاڑیاں' },
  'wedding-stationery': { singular: 'دعوت نامے', plural: 'دعوت نامے', short: 'کارڈ' },
  'wedding-djs': { singular: 'ڈی جے اور ڈھول', plural: 'ڈی جے اور ڈھول', short: 'موسیقی' },
  'wedding-mithai': { singular: 'مٹھائی کی دکان', plural: 'مٹھائی', short: 'مٹھائی' },
  'nikah-khwan': { singular: 'نکاح خواں', plural: 'نکاح خواں', short: 'نکاح' },
  'wedding-generators': { singular: 'جنریٹر کرایہ', plural: 'جنریٹر کرایہ', short: 'جنریٹر' },
  'wedding-cake-designers': { singular: 'شادی کا کیک', plural: 'شادی کے کیک', short: 'کیک' },
  'wedding-planners': { singular: 'ویڈنگ پلانر', plural: 'ویڈنگ پلانرز', short: 'پلانر' },
};

/**
 * The label to SHOW for a category. English falls back through
 * `short → plural → singular` exactly as the call sites did by hand.
 *
 * A missing Urdu entry falls back to English rather than to a key or a dash: a
 * new category added on the web should appear in the Urdu app immediately, in
 * English, instead of vanishing from the rail.
 */
export function categoryLabel(
  cat: VendorCategory | undefined,
  isUrdu: boolean,
  form: 'singular' | 'plural' | 'short' = 'singular',
): string {
  if (!cat) return '';
  if (isUrdu) {
    const ur = URDU_LABELS[cat.slug];
    if (ur) return ur[form];
  }
  if (form === 'short') return cat.short ?? cat.plural;
  return cat[form];
}

/** Extra backend `vendorType` strings folded into an existing slug (web parity). */
export const BACKEND_TYPE_ALIASES: Record<string, string> = {
  'Marquee rental': 'wedding-venues',
  Florist: 'wedding-decorators',
  'Qawwali and Naat': 'wedding-djs',
  'Sound system rental': 'wedding-djs',
};

/** Categories that actually have vendors in the backend (for the browse grid). */
export const BROWSABLE_CATEGORIES = CATEGORIES.filter((c) => c.backendType !== null);

export function categoryBySlug(slug: string): VendorCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Backend `vendorType` string → SEO slug (primary map + fold aliases). */
export function backendTypeToSlug(vendorType: string | null | undefined): string | null {
  if (!vendorType) return null;
  const direct = CATEGORIES.find((c) => c.backendType?.toLowerCase() === vendorType.toLowerCase());
  if (direct) return direct.slug;
  const aliased = Object.entries(BACKEND_TYPE_ALIASES).find(
    ([backend]) => backend.toLowerCase() === vendorType.toLowerCase(),
  );
  return aliased ? aliased[1] : null;
}

/** Does a vendor (by its backend vendorType) belong to a category slug? */
export function vendorMatchesCategory(vendorType: string | null | undefined, slug: string): boolean {
  return backendTypeToSlug(vendorType) === slug;
}
