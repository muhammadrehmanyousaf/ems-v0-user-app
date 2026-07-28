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
}

export const CATEGORIES: VendorCategory[] = [
  { slug: 'wedding-venues', singular: 'Wedding Venue', plural: 'Wedding Venues', backendType: 'Wedding venue', icon: 'business-outline', description: 'Banquet halls, marquees, lawns, hotels, farmhouses for the barat, walima, and mehndi.' },
  { slug: 'wedding-photographers', singular: 'Wedding Photographer', plural: 'Wedding Photographers', backendType: 'Photographer', icon: 'camera-outline', description: 'Photographers and cinematographers capturing every shaadi function.' },
  { slug: 'caterers', singular: 'Caterer', plural: 'Caterers', backendType: 'Catering', icon: 'restaurant-outline', description: 'Wedding caterers serving Pakistani, continental, BBQ, and fusion menus.' },
  { slug: 'wedding-decorators', singular: 'Wedding Decorator', plural: 'Wedding Decorators', backendType: 'Decorator', icon: 'flower-outline', description: 'Stage, mandap, and entrance decor — traditional through modern.' },
  { slug: 'mehndi-artists', singular: 'Mehndi Artist', plural: 'Mehndi Artists', backendType: 'Henna artist', icon: 'hand-left-outline', description: 'Bridal mehndi designers — Indian, Arabic, Pakistani, and Moroccan styles.' },
  { slug: 'bridal-makeup-artists', singular: 'Bridal Makeup Artist', plural: 'Bridal Makeup Artists', backendType: 'Makeup artist', icon: 'brush-outline', description: 'Bridal makeup, hair, and grooming for every wedding function.' },
  { slug: 'bridal-wear', singular: 'Bridal Wear', plural: 'Bridal Wear', backendType: 'Bridal wearing', icon: 'shirt-outline', description: 'Designer lehengas, ghararas, and wedding outfits — ready-made and bespoke.' },
  { slug: 'wedding-cars', singular: 'Wedding Car', plural: 'Wedding Cars', backendType: 'Car rental', icon: 'car-sport-outline', description: 'Decorated cars and luxury rentals for the rukhsati.' },
  { slug: 'wedding-stationery', singular: 'Wedding Stationery', plural: 'Wedding Stationery', backendType: 'Wedding Invitations and Stationery', icon: 'mail-outline', description: 'Invitation cards, save-the-dates, and bespoke wedding stationery.' },
  { slug: 'wedding-djs', singular: 'Wedding DJ', plural: 'Wedding DJs', backendType: 'Dhol player', icon: 'musical-notes-outline', description: 'DJs, dholis, qawwals, and live performers for every wedding function.' },
  { slug: 'wedding-mithai', singular: 'Mithai & Sweets Shop', plural: 'Mithai & Sweets', backendType: 'Mithai and sweets', icon: 'ice-cream-outline', description: 'Traditional mithai, barfi, ladoo, and wedding sweets.' },
  { slug: 'nikah-khwan', singular: 'Nikah Khwan', plural: 'Nikah Khwans', backendType: 'Nikahkhwan', icon: 'book-outline', description: 'Nikah khwans and officiants to solemnise your nikah ceremony.' },
  { slug: 'wedding-generators', singular: 'Generator Rental', plural: 'Generator Rentals', backendType: 'Generator rental', icon: 'flash-outline', description: 'Backup power and generator rentals for every wedding function.' },
  { slug: 'wedding-cake-designers', singular: 'Wedding Cake Designer', plural: 'Wedding Cake Designers', backendType: 'Wedding cakes', icon: 'gift-outline', description: 'Custom wedding cakes and dessert tables for the big day.' },
  { slug: 'wedding-planners', singular: 'Wedding Planner', plural: 'Wedding Planners', backendType: null, icon: 'clipboard-outline', description: 'Full-service event planners coordinating every detail end-to-end.' },
];

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
