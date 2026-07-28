/** UI strings, EN + UR. Urdu verified for the core navigation & screens. */
export type Locale = 'en' | 'ur';

type Entry = { en: string; ur: string };

export const STRINGS = {
  // Tabs
  'tab.home': { en: 'Home', ur: 'ہوم' },
  'tab.explore': { en: 'Explore', ur: 'تلاش' },
  'tab.plan': { en: 'Plan', ur: 'منصوبہ' },
  'tab.inbox': { en: 'Inbox', ur: 'پیغامات' },
  'tab.account': { en: 'Account', ur: 'اکاؤنٹ' },

  // Common
  'common.signInRegister': { en: 'Sign in / Register', ur: 'سائن اِن / رجسٹر' },
  'common.signOut': { en: 'Sign out', ur: 'سائن آؤٹ' },
  'common.exploreVendors': { en: 'Explore vendors', ur: 'وینڈرز دیکھیں' },
  'common.savedVendors': { en: 'Saved vendors', ur: 'محفوظ وینڈرز' },
  'common.compareVendors': { en: 'Compare vendors', ur: 'وینڈرز کا موازنہ' },

  // Account
  'account.title': { en: 'Account', ur: 'اکاؤنٹ' },
  'account.guest': { en: 'Guest', ur: 'مہمان' },
  'account.signedIn': { en: 'Signed in', ur: 'سائن اِن' },
  'account.signInPrompt': { en: 'Sign in to save vendors & book', ur: 'وینڈرز محفوظ کرنے اور بکنگ کے لیے سائن اِن کریں' },
  'account.myBookings': { en: 'My bookings', ur: 'میری بکنگز' },
  'account.editProfile': { en: 'Edit profile', ur: 'پروفائل میں ترمیم' },
  'account.language': { en: 'LANGUAGE', ur: 'زبان' },
  'account.tagline': { en: "Wedding Wala — Pakistan's #1 shaadi platform.", ur: 'ویڈنگ والا — پاکستان کا نمبر ۱ شادی پلیٹ فارم۔' },

  // Plan
  'plan.title': { en: 'Plan your shaadi', ur: 'اپنی شادی کی منصوبہ بندی' },
  'plan.subtitle': { en: 'Everything for the big day, in one place.', ur: 'بڑے دن کی ہر چیز، ایک جگہ۔' },
  'plan.shortlist': { en: 'Your shortlist', ur: 'آپ کی شارٹ لسٹ' },
  'plan.tools': { en: 'PLANNING TOOLS', ur: 'منصوبہ بندی کے ٹولز' },
  'plan.savedNote': { en: 'Your plans are saved on this device.', ur: 'آپ کے منصوبے اسی ڈیوائس پر محفوظ ہیں۔' },
  'tool.budget': { en: 'Budget', ur: 'بجٹ' },
  'tool.checklist': { en: 'Checklist', ur: 'چیک لسٹ' },
  'tool.guests': { en: 'Guest list', ur: 'مہمانوں کی فہرست' },
  'tool.timeline': { en: 'Timeline', ur: 'ٹائم لائن' },
} as const satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, locale: Locale): string {
  const entry = STRINGS[key];
  return entry[locale] ?? entry.en;
}
