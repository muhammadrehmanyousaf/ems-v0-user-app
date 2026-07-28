/** Query key factory — one source of truth for cache keys. */
export const qk = {
  vendors: (params?: Record<string, unknown>) => ['vendors', params ?? {}] as const,
  vendorsByType: (type: string) => ['vendors', 'byType', type] as const,
  vendor: (id: number | string) => ['vendor', String(id)] as const,
  vendorReviews: (id: number | string) => ['vendor', String(id), 'reviews'] as const,
  vendorAvailability: (id: number | string, month: string) =>
    ['vendor', String(id), 'availability', month] as const,
  vendorRelated: (id: number | string) => ['vendor', String(id), 'related'] as const,
  platformStats: () => ['platform-stats'] as const,
  favorites: () => ['favorites'] as const,
};
