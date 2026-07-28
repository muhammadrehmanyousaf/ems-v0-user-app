/** Planning-tool data models — same shape as the web, seeded for a Pakistani shaadi. */
import type { WithId } from './useLocalList';

export type Priority = 'high' | 'medium' | 'low';

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

export const BUDGET_SEED: BudgetItem[] = [
  { id: 'b1', category: 'Venue', item: 'Barat hall', estimated: 400000, actual: 0, priority: 'high' },
  { id: 'b2', category: 'Catering', item: 'Walima dinner (per head)', estimated: 350000, actual: 0, priority: 'high' },
  { id: 'b3', category: 'Photography & Video', item: 'Full shaadi coverage', estimated: 150000, actual: 0, priority: 'high' },
  { id: 'b4', category: 'Bridal Wear', item: 'Barat lehnga', estimated: 200000, actual: 0, priority: 'medium' },
  { id: 'b5', category: 'Mehndi & Makeup', item: 'Bridal makeup', estimated: 80000, actual: 0, priority: 'medium' },
  { id: 'b6', category: 'Decor & Flowers', item: 'Stage & entrance decor', estimated: 120000, actual: 0, priority: 'medium' },
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

export const CHECKLIST_SEED: ChecklistItem[] = [
  { id: 'c1', title: 'Book barat & walima venue', completed: false, category: 'Venue', priority: 'high' },
  { id: 'c2', title: 'Hire photographer', completed: false, category: 'Vendors', priority: 'high' },
  { id: 'c3', title: 'Book caterer', completed: false, category: 'Catering', priority: 'high' },
  { id: 'c4', title: 'Choose bridal lehnga', completed: false, category: 'Bridal', priority: 'medium' },
  { id: 'c5', title: 'Book mehndi artist', completed: false, category: 'Vendors', priority: 'medium' },
  { id: 'c6', title: 'Order invitation cards', completed: false, category: 'Invitations', priority: 'medium' },
  { id: 'c7', title: 'Arrange dholki & dhol players', completed: false, category: 'Events', priority: 'low' },
  { id: 'c8', title: 'Book cars for rukhsati', completed: false, category: 'Transport', priority: 'medium' },
  { id: 'c9', title: 'Nikah registration / Nikahnama', completed: false, category: 'Documentation', priority: 'high' },
  { id: 'c10', title: 'Order mithai & favours', completed: false, category: 'Catering', priority: 'low' },
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

export const GUEST_SEED: GuestItem[] = [
  { id: 'g1', name: 'Ahmed & family', group: "Groom's family", rsvp: 'attending', count: 5 },
  { id: 'g2', name: 'Fatima Khala', group: 'Relatives', rsvp: 'pending', count: 3 },
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

export const TIMELINE_SEED: TimelineItem[] = [
  { id: 't1', time: '10:00', event: 'Bridal hair & makeup', duration: '3 hrs', location: "Bride's home", category: 'Getting Ready', priority: 'high' },
  { id: 't2', time: '13:00', event: 'Photographer arrives', duration: '30 min', location: 'Venue', category: 'Photography', priority: 'medium' },
  { id: 't3', time: '17:00', event: 'Barat departs', duration: '1 hr', location: "Groom's side", category: 'Barat', priority: 'high' },
  { id: 't4', time: '18:00', event: 'Nikah ceremony', duration: '1 hr', location: 'Main hall', category: 'Nikah', priority: 'high' },
  { id: 't5', time: '22:00', event: 'Rukhsati', duration: '30 min', location: 'Venue exit', category: 'Barat', priority: 'high' },
];

export const PRIORITY_TONE: Record<Priority, 'danger' | 'gold' | 'neutral'> = {
  high: 'danger',
  medium: 'gold',
  low: 'neutral',
};
