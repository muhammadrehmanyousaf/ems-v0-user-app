/** Wedding guides — curated from weddingwala.pk's real guide pages. Each opens
 * the live article in an in-app browser (full content without duplicating it). */
import type Ionicons from '@expo/vector-icons/Ionicons';

type IconName = keyof typeof Ionicons.glyphMap;

export const WEB_BASE = 'https://www.weddingwala.pk';

export interface Guide {
  slug: string;
  title: string;
}

export interface GuideGroup {
  title: string;
  icon: IconName;
  guides: Guide[];
}

export const GUIDE_GROUPS: GuideGroup[] = [
  {
    title: 'Planning',
    icon: 'clipboard-outline',
    guides: [
      { slug: 'how-to-plan-a-wedding-in-pakistan', title: 'How to plan a wedding in Pakistan' },
      { slug: 'pakistani-wedding-checklist-and-timeline', title: 'Wedding checklist & timeline' },
      { slug: 'how-to-plan-a-mehndi-function', title: 'How to plan a mehndi function' },
      { slug: 'how-to-save-money-on-a-wedding-in-pakistan', title: 'How to save money on your wedding' },
      { slug: 'best-time-to-get-married-in-pakistan', title: 'Best time to get married in Pakistan' },
      { slug: 'destination-weddings-in-pakistan', title: 'Destination weddings in Pakistan' },
    ],
  },
  {
    title: 'Costs',
    icon: 'wallet-outline',
    guides: [
      { slug: 'wedding-cost-in-pakistan', title: 'Wedding cost in Pakistan' },
      { slug: 'wedding-cost-in-lahore', title: 'Wedding cost in Lahore' },
      { slug: 'wedding-cost-in-karachi', title: 'Wedding cost in Karachi' },
      { slug: 'wedding-cost-in-islamabad', title: 'Wedding cost in Islamabad' },
      { slug: 'bridal-makeup-cost-in-lahore', title: 'Bridal makeup cost in Lahore' },
      { slug: 'who-pays-for-what-pakistani-wedding-expenses-guide', title: 'Who pays for what?' },
    ],
  },
  {
    title: 'Choosing vendors',
    icon: 'ribbon-outline',
    guides: [
      { slug: 'how-to-choose-a-wedding-venue-in-pakistan', title: 'How to choose a venue' },
      { slug: 'how-to-choose-a-wedding-photographer-in-pakistan', title: 'How to choose a photographer' },
      { slug: 'how-to-choose-a-wedding-caterer-in-pakistan', title: 'How to choose a caterer' },
      { slug: 'how-to-choose-a-wedding-decorator-in-pakistan', title: 'How to choose a decorator' },
      { slug: 'how-to-choose-a-bridal-makeup-artist-in-pakistan', title: 'How to choose a makeup artist' },
      { slug: 'how-to-choose-a-mehndi-artist-in-pakistan', title: 'How to choose a mehndi artist' },
    ],
  },
  {
    title: 'Bridal & groom',
    icon: 'sparkles-outline',
    guides: [
      { slug: 'bridal-mehndi-designs-guide', title: 'Bridal mehndi designs' },
      { slug: 'bridal-makeup-looks-guide-pakistan', title: 'Bridal makeup looks' },
      { slug: 'bridal-hairstyles-guide-pakistan', title: 'Bridal hairstyles' },
      { slug: 'bridal-jewellery-guide-pakistan', title: 'Bridal jewellery guide' },
      { slug: 'pakistani-bridal-dress-guide', title: 'Pakistani bridal dress guide' },
      { slug: 'groom-sherwani-guide-pakistan', title: 'Groom sherwani guide' },
    ],
  },
  {
    title: 'Traditions & rasms',
    icon: 'heart-outline',
    guides: [
      { slug: 'barat-traditions-pakistani-wedding-guide', title: 'Barat traditions' },
      { slug: 'mayun-and-dholki-guide-pakistan', title: 'Mayun & dholki guide' },
      { slug: 'what-is-walima-pakistani-wedding-guide', title: 'What is walima?' },
      { slug: 'pakistani-wedding-events-order', title: 'Order of wedding events' },
      { slug: 'pakistani-wedding-gift-etiquette-and-salami-guide', title: 'Gift & salami etiquette' },
    ],
  },
  {
    title: 'Nikah & legal',
    icon: 'document-text-outline',
    guides: [
      { slug: 'nikah-process-in-pakistan', title: 'Nikah process in Pakistan' },
      { slug: 'nikahnama-clauses-and-haq-mehr-guide-pakistan', title: 'Nikahnama & haq mehr' },
      { slug: 'nadra-marriage-certificate-guide-pakistan', title: 'NADRA marriage certificate' },
      { slug: 'court-marriage-in-pakistan', title: 'Court marriage in Pakistan' },
      { slug: 'one-dish-law-and-wedding-guest-limits-pakistan', title: 'One-dish law & guest limits' },
    ],
  },
];

export const GUIDE_COUNT = GUIDE_GROUPS.reduce((n, g) => n + g.guides.length, 0);
