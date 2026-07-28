/**
 * Vendor (business) types — modelled on the real backend row shape
 * (GET /api/v1/businesses). Only the fields the app consumes are typed; the
 * backend returns ~120 columns, so unknown extras are tolerated.
 */

export interface VendorUser {
  id: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  /** Backend `User.vendorType` enum, e.g. "Photographer", "Wedding venue". */
  vendorType?: string;
  city?: string;
  subArea?: string;
  isVendor?: boolean;
}

export interface Reliability {
  score: number;
  tier: 'newcomer' | 'rising' | 'established' | 'trusted' | 'elite' | string;
  badges: string[];
  breakdown?: Record<string, number>;
}

export interface VendorPackage {
  id?: number;
  name?: string;
  price?: number | null;
  description?: string | null;
  inclusions?: string[] | null;
  [key: string]: unknown;
}

export interface Vendor {
  id: number;
  name: string;
  slug: string | null;
  description?: string | null;
  brandLogo?: string | null;
  images?: string[] | null;
  city?: string | null;
  subArea?: string | null;
  minimumPrice?: number | null;
  rating: number;
  reviewCount: number;
  verificationTier: number;
  sponsored: boolean;
  vacationMode: boolean;
  vacationMessage?: string | null;
  subBusinessType?: string[] | string | null;
  amenities?: string[] | null;
  serviceProvided?: string[] | null;
  expertise?: string[] | null;
  languagesSpoken?: string[] | null;
  cityCovered?: string[] | null;
  maxCapacity?: number | null;
  minCapacity?: number | null;
  whatsappNumber?: string | null;
  ownerName?: string | null;
  ownerBio?: string | null;
  yearsInBusiness?: number | null;
  weddingsCompleted?: number | null;
  cancelationPolicy?: string | null;
  additionalInfo?: string | null;
  vendor?: VendorUser;
  reliability?: Reliability;
  packages?: VendorPackage[];
  menus?: unknown[];
  isFavorite?: boolean;
  [key: string]: unknown;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string | null;
  authorName?: string | null;
  createdAt?: string;
  images?: string[] | null;
  [key: string]: unknown;
}

export interface PlatformStats {
  vendors: number;
  couplesServed: number;
  cities: number;
}

/** Query params accepted by the client-side vendor filter. */
export interface VendorFilters {
  search?: string;
  categorySlug?: string | null;
  city?: string | null;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
  sort?: VendorSort;
}

export type VendorSort = 'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'name' | 'recent';
