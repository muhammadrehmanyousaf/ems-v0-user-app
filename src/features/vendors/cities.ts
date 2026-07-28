/** Pakistani cities — ported from the web (lib/seo/constants.CITIES). Names match
 * the backend `city` values so they filter cleanly. */
export interface City {
  name: string;
  region: string;
  featured?: boolean;
}

export const CITIES: City[] = [
  { name: 'Karachi', region: 'Sindh', featured: true },
  { name: 'Lahore', region: 'Punjab', featured: true },
  { name: 'Islamabad', region: 'ICT', featured: true },
  { name: 'Rawalpindi', region: 'Punjab', featured: true },
  { name: 'Faisalabad', region: 'Punjab', featured: true },
  { name: 'Multan', region: 'Punjab', featured: true },
  { name: 'Peshawar', region: 'KPK', featured: true },
  { name: 'Sialkot', region: 'Punjab', featured: true },
  { name: 'Gujranwala', region: 'Punjab', featured: true },
  { name: 'Hyderabad', region: 'Sindh', featured: true },
  { name: 'Quetta', region: 'Balochistan', featured: true },
  { name: 'Bahawalpur', region: 'Punjab', featured: true },
  { name: 'Sargodha', region: 'Punjab' },
  { name: 'Sheikhupura', region: 'Punjab' },
  { name: 'Gujrat', region: 'Punjab' },
  { name: 'Sukkur', region: 'Sindh' },
  { name: 'Abbottabad', region: 'KPK' },
  { name: 'Mardan', region: 'KPK' },
  { name: 'Rahim Yar Khan', region: 'Punjab' },
  { name: 'Jhelum', region: 'Punjab' },
];

export const FEATURED_CITIES = CITIES.filter((c) => c.featured);
