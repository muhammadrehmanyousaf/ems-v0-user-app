/**
 * Planning-tool data models — same shape as the web, seeded for a Pakistani
 * shaadi.
 *
 * ── The tools shipped an English spreadsheet to Urdu customers ────────────
 *
 * Every screen's chrome was translated and every row inside it was not. The
 * budget opened on "Venue / Catering / Bridal Wear" over "Barat hall / Walima
 * dinner (per head)", under an Urdu title, in an Urdu app, on the tab an Urdu
 * customer is most likely to actually sit and work in.
 *
 * ── Why the English strings are still here ────────────────────────────────
 *
 * `category` and `group` are STORED on every row and persisted to device
 * storage, and the add-forms filter against them. Translating the values would
 * orphan every row a customer has already saved. So the English string stays as
 * the key and `planLabel()` supplies what is shown — the same split used for
 * vendor categories, where the slug and `backendType` likewise cannot move.
 *
 * The seeds are different: their text is free-form and the customer edits it, so
 * there is nothing to key against. They are seeded in the interface language at
 * the moment the list is first created. Switching language later does NOT
 * rewrite them, which is deliberate — by then they may have been edited, and
 * silently overwriting someone's own words is worse than a mixed list.
 */
import type { WithId } from './useLocalList';

export type Priority = 'high' | 'medium' | 'low';

// ── Urdu ────────────────────────────────────────────────────────────────────

/**
 * Display Urdu for every fixed English string in this file. Keyed by the English
 * value, which is what is stored. A missing entry falls back to the English, so
 * a category added on the web shows up here in English rather than blank.
 */
const PLAN_UR: Record<string, string> = {
  // Budget categories
  Venue: 'مقام',
  Catering: 'کھانا',
  'Photography & Video': 'فوٹو و ویڈیو',
  'Bridal Wear': 'دلہن کا لباس',
  'Groom Wear': 'دولہا کا لباس',
  'Mehndi & Makeup': 'مہندی و میک اپ',
  'Decor & Flowers': 'ڈیکور و پھول',
  Jewellery: 'زیورات',
  'Cars & Transport': 'گاڑیاں و ٹرانسپورٹ',
  Invitations: 'دعوت نامے',
  'Mithai & Favours': 'مٹھائی و تحائف',
  'Music & Dhol': 'موسیقی و ڈھول',
  Miscellaneous: 'متفرق',
  // Checklist categories
  Vendors: 'وینڈرز',
  Bridal: 'دلہن',
  Groom: 'دولہا',
  Events: 'تقریبات',
  Transport: 'ٹرانسپورٹ',
  Documentation: 'کاغذات',
  // Guest groups
  "Bride's family": 'دلہن کے اہلِ خانہ',
  "Groom's family": 'دولہا کے اہلِ خانہ',
  Relatives: 'رشتہ دار',
  Friends: 'دوست',
  Colleagues: 'ساتھی',
  Neighbours: 'پڑوسی',
  // Timeline categories
  'Getting Ready': 'تیاری',
  Mehndi: 'مہندی',
  Nikah: 'نکاح',
  Barat: 'بارات',
  Walima: 'ولیمہ',
  Photography: 'فوٹوگرافی',
  Other: 'دیگر',
};

/** What to SHOW for a stored category/group value. Never what to store. */
export function planLabel(value: string, isUrdu: boolean): string {
  return (isUrdu && PLAN_UR[value]) || value;
}


// ── Budget ──────────────────────────────────────────────────────────────────
export interface BudgetItem extends WithId {
  category: string;
  item: string;
  estimated: number;
  actual: number;
  priority: Priority;
  notes?: string;
}

export const BUDGET_CATEGORIES = [
  'Venue', 'Catering', 'Photography & Video', 'Bridal Wear', 'Groom Wear',
  'Mehndi & Makeup', 'Decor & Flowers', 'Jewellery', 'Cars & Transport',
  'Invitations', 'Mithai & Favours', 'Music & Dhol', 'Miscellaneous',
];

export const BUDGET_SEED = (isUrdu = false): BudgetItem[] => [
  { id: 'b1', category: 'Venue', item: isUrdu ? 'بارات ہال' : 'Barat hall', estimated: 400000, actual: 0, priority: 'high' },
  { id: 'b2', category: 'Catering', item: isUrdu ? 'ولیمہ کھانا (فی کس)' : 'Walima dinner (per head)', estimated: 350000, actual: 0, priority: 'high' },
  { id: 'b3', category: 'Photography & Video', item: isUrdu ? 'مکمل شادی کوریج' : 'Full shaadi coverage', estimated: 150000, actual: 0, priority: 'high' },
  { id: 'b4', category: 'Bridal Wear', item: isUrdu ? 'بارات کا لہنگا' : 'Barat lehnga', estimated: 200000, actual: 0, priority: 'medium' },
  { id: 'b5', category: 'Mehndi & Makeup', item: isUrdu ? 'دلہن کا میک اپ' : 'Bridal makeup', estimated: 80000, actual: 0, priority: 'medium' },
  { id: 'b6', category: 'Decor & Flowers', item: isUrdu ? 'اسٹیج و داخلی ڈیکور' : 'Stage & entrance decor', estimated: 120000, actual: 0, priority: 'medium' },
];

// ── Checklist ─────────────────────────────────────────────────────────────────
export interface ChecklistItem extends WithId {
  title: string;
  completed: boolean;
  category: string;
  priority: Priority;
}

export const CHECKLIST_CATEGORIES = [
  'Venue', 'Vendors', 'Bridal', 'Groom', 'Events', 'Catering',
  'Invitations', 'Jewellery', 'Transport', 'Documentation',
];

export const CHECKLIST_SEED = (isUrdu = false): ChecklistItem[] => [
  { id: 'c1', title: isUrdu ? 'بارات و ولیمہ کا مقام بک کریں' : 'Book barat & walima venue', completed: false, category: 'Venue', priority: 'high' },
  { id: 'c2', title: isUrdu ? 'فوٹوگرافر بک کریں' : 'Hire photographer', completed: false, category: 'Vendors', priority: 'high' },
  { id: 'c3', title: isUrdu ? 'کیٹرر بک کریں' : 'Book caterer', completed: false, category: 'Catering', priority: 'high' },
  { id: 'c4', title: isUrdu ? 'دلہن کا لہنگا منتخب کریں' : 'Choose bridal lehnga', completed: false, category: 'Bridal', priority: 'medium' },
  { id: 'c5', title: isUrdu ? 'مہندی آرٹسٹ بک کریں' : 'Book mehndi artist', completed: false, category: 'Vendors', priority: 'medium' },
  { id: 'c6', title: isUrdu ? 'دعوتی کارڈ آرڈر کریں' : 'Order invitation cards', completed: false, category: 'Invitations', priority: 'medium' },
  { id: 'c7', title: isUrdu ? 'ڈھولکی و ڈھول والوں کا انتظام کریں' : 'Arrange dholki & dhol players', completed: false, category: 'Events', priority: 'low' },
  { id: 'c8', title: isUrdu ? 'رخصتی کے لیے گاڑیاں بک کریں' : 'Book cars for rukhsati', completed: false, category: 'Transport', priority: 'medium' },
  { id: 'c9', title: isUrdu ? 'نکاح رجسٹریشن / نکاح نامہ' : 'Nikah registration / Nikahnama', completed: false, category: 'Documentation', priority: 'high' },
  { id: 'c10', title: isUrdu ? 'مٹھائی و تحائف آرڈر کریں' : 'Order mithai & favours', completed: false, category: 'Catering', priority: 'low' },
];

// ── Guest list ───────────────────────────────────────────────────────────────
export type Rsvp = 'pending' | 'attending' | 'declined';

export interface GuestItem extends WithId {
  name: string;
  group: string;
  rsvp: Rsvp;
  count: number; // party size (self + plus-ones)
  phone?: string;
}

export const GUEST_GROUPS = [
  "Bride's family", "Groom's family", 'Relatives', 'Friends', 'Colleagues', 'Neighbours',
];

export const GUEST_SEED = (isUrdu = false): GuestItem[] => [
  { id: 'g1', name: isUrdu ? 'احمد اور اہلِ خانہ' : 'Ahmed & family', group: "Groom's family", rsvp: 'attending', count: 5 },
  { id: 'g2', name: isUrdu ? 'فاطمہ خالہ' : 'Fatima Khala', group: 'Relatives', rsvp: 'pending', count: 3 },
];

// ── Timeline ─────────────────────────────────────────────────────────────────
export interface TimelineItem extends WithId {
  time: string; // "HH:MM"
  event: string;
  duration?: string;
  location?: string;
  responsible?: string;
  category: string;
  priority: Priority;
}

export const TIMELINE_CATEGORIES = ['Getting Ready', 'Mehndi', 'Nikah', 'Barat', 'Walima', 'Photography', 'Other'];

export const TIMELINE_SEED = (isUrdu = false): TimelineItem[] => [
  { id: 't1', time: '10:00', event: isUrdu ? 'دلہن کے بال و میک اپ' : 'Bridal hair & makeup', duration: isUrdu ? '3 گھنٹے' : '3 hrs', location: isUrdu ? 'دلہن کا گھر' : "Bride's home", category: 'Getting Ready', priority: 'high' },
  { id: 't2', time: '13:00', event: isUrdu ? 'فوٹوگرافر کی آمد' : 'Photographer arrives', duration: isUrdu ? '30 منٹ' : '30 min', location: isUrdu ? 'مقام' : 'Venue', category: 'Photography', priority: 'medium' },
  { id: 't3', time: '17:00', event: isUrdu ? 'بارات کی روانگی' : 'Barat departs', duration: isUrdu ? '1 گھنٹہ' : '1 hr', location: isUrdu ? 'دولہا کی طرف' : "Groom's side", category: 'Barat', priority: 'high' },
  { id: 't4', time: '18:00', event: isUrdu ? 'نکاح کی تقریب' : 'Nikah ceremony', duration: isUrdu ? '1 گھنٹہ' : '1 hr', location: isUrdu ? 'مرکزی ہال' : 'Main hall', category: 'Nikah', priority: 'high' },
  { id: 't5', time: '22:00', event: isUrdu ? 'رخصتی' : 'Rukhsati', duration: isUrdu ? '30 منٹ' : '30 min', location: isUrdu ? 'مقام سے باہر' : 'Venue exit', category: 'Barat', priority: 'high' },
];

export const PRIORITY_TONE: Record<Priority, 'danger' | 'gold' | 'neutral'> = {
  high: 'danger',
  medium: 'gold',
  low: 'neutral',
};
