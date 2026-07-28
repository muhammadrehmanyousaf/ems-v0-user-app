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
  'common.signIn': { en: 'Sign in', ur: 'سائن اِن' },
  'common.signOut': { en: 'Sign out', ur: 'سائن آؤٹ' },
  'common.exploreVendors': { en: 'Explore vendors', ur: 'وینڈرز دیکھیں' },
  'common.savedVendors': { en: 'Saved vendors', ur: 'محفوظ وینڈرز' },
  'common.compareVendors': { en: 'Compare vendors', ur: 'وینڈرز کا موازنہ' },
  'common.retry': { en: 'Retry', ur: 'دوبارہ کوشش کریں' },
  'common.seeAll': { en: 'See all', ur: 'سب دیکھیں' },
  'common.clearAll': { en: 'Clear all', ur: 'سب صاف کریں' },
  'common.all': { en: 'All', ur: 'تمام' },
  'common.done': { en: 'Done', ur: 'مکمل' },

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

  // Home
  'home.badge': { en: "PAKISTAN'S #1 SHAADI PLATFORM", ur: 'پاکستان کا نمبر ۱ شادی پلیٹ فارم' },
  'home.searchPlaceholder': { en: 'Search vendors, venues, cities…', ur: 'وینڈرز، مقامات، شہر تلاش کریں…' },
  'home.vendors': { en: 'vendors', ur: 'وینڈرز' },
  'home.cities': { en: 'cities', ur: 'شہر' },
  'home.browseCategory': { en: 'BROWSE BY CATEGORY', ur: 'زمرے کے لحاظ سے دیکھیں' },
  'home.browseCity': { en: 'BROWSE BY CITY', ur: 'شہر کے لحاظ سے دیکھیں' },
  'home.recentlyViewed': { en: 'Recently viewed', ur: 'حال ہی میں دیکھے گئے' },
  'home.featuredVenues': { en: 'Featured venues', ur: 'نمایاں مقامات' },
  'home.topPhotographers': { en: 'Top photographers', ur: 'بہترین فوٹوگرافرز' },
  'home.caterers': { en: 'Caterers', ur: 'کیٹررز' },
  'home.bridalMakeup': { en: 'Bridal makeup', ur: 'دلہن میک اپ' },
  'home.weddingGuides': { en: 'Wedding guides', ur: 'شادی گائیڈز' },
  'home.guidesSub': { en: 'Costs, rasms, choosing vendors & more', ur: 'اخراجات، رسمیں، وینڈرز کا انتخاب اور مزید' },
  'home.threeSteps': { en: 'THREE STEPS TO YOUR SHAADI', ur: 'آپ کی شادی کے تین مراحل' },
  'home.liveNote': { en: 'Every vendor here is live from the same platform as weddingwala.pk.', ur: 'یہاں ہر وینڈر weddingwala.pk کے اسی پلیٹ فارم سے براہِ راست ہے۔' },
  'home.step1Title': { en: 'Discover', ur: 'دریافت کریں' },
  'home.step1Body': { en: 'Browse 3,000+ trusted vendors by category, city, budget & rating.', ur: '۳۰۰۰ سے زائد معتبر وینڈرز کو زمرہ، شہر، بجٹ اور ریٹنگ کے لحاظ سے دیکھیں۔' },
  'home.step2Title': { en: 'Shortlist & compare', ur: 'شارٹ لسٹ اور موازنہ' },
  'home.step2Body': { en: 'Save your favourites and compare them side by side.', ur: 'اپنے پسندیدہ محفوظ کریں اور ساتھ ساتھ موازنہ کریں۔' },
  'home.step3Title': { en: 'Connect', ur: 'رابطہ کریں' },
  'home.step3Body': { en: 'Message vendors on WhatsApp or request a booking — no middleman.', ur: 'وینڈرز کو واٹس ایپ پر پیغام بھیجیں یا بکنگ کی درخواست کریں — بغیر کسی بیچ والے کے۔' },

  // Explore
  'explore.title': { en: 'Explore', ur: 'تلاش' },
  'explore.searchPlaceholder': { en: 'Search vendors, cities…', ur: 'وینڈرز، شہر تلاش کریں…' },
  'explore.vendorsCount': { en: 'vendors', ur: 'وینڈرز' },
  'explore.filters': { en: 'Filters', ur: 'فلٹرز' },
  'explore.loadingAll': { en: 'Loading all matching vendors…', ur: 'تمام متعلقہ وینڈرز لوڈ ہو رہے ہیں…' },
  'explore.loadError': { en: 'Couldn’t load vendors', ur: 'وینڈرز لوڈ نہیں ہو سکے' },
  'explore.loadErrorSub': { en: 'Check your connection and try again.', ur: 'اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں۔' },
  'explore.noMatch': { en: 'No vendors match', ur: 'کوئی وینڈر نہیں ملا' },
  'explore.noMatchSub': { en: 'Try widening your budget, clearing a filter, or a different category.', ur: 'اپنا بجٹ بڑھائیں، کوئی فلٹر ہٹائیں، یا مختلف زمرہ آزمائیں۔' },

  // Inbox
  'inbox.title': { en: 'Inbox', ur: 'پیغامات' },
  'inbox.markAllRead': { en: 'Mark all read', ur: 'سب پڑھا ہوا نشان زد کریں' },
  'inbox.signInTitle': { en: 'Sign in for your inbox', ur: 'اپنے پیغامات کے لیے سائن اِن کریں' },
  'inbox.signInSub': { en: 'Booking updates and vendor messages appear here.', ur: 'بکنگ اپڈیٹس اور وینڈر پیغامات یہاں ظاہر ہوں گے۔' },
  'inbox.emptyTitle': { en: 'You’re all caught up', ur: 'آپ نے سب دیکھ لیا' },
  'inbox.emptySub': { en: 'Booking updates and messages will appear here.', ur: 'بکنگ اپڈیٹس اور پیغامات یہاں ظاہر ہوں گے۔' },

  // Favourites
  'fav.title': { en: 'Saved', ur: 'محفوظ' },
  'fav.emptyTitle': { en: 'No saved vendors yet', ur: 'ابھی کوئی محفوظ وینڈر نہیں' },
  'fav.emptySub': { en: 'Tap the heart on any vendor to shortlist them here.', ur: 'کسی بھی وینڈر پر دل دبائیں تاکہ وہ یہاں شارٹ لسٹ ہو جائے۔' },

  // Compare
  'compare.title': { en: 'Compare', ur: 'موازنہ' },
  'compare.emptyTitle': { en: 'Add vendors to compare', ur: 'موازنے کے لیے وینڈرز شامل کریں' },
  'compare.emptySub': { en: 'Tap the compare icon on any vendor card to line them up (up to 4).', ur: 'کسی بھی وینڈر کارڈ پر موازنہ آئیکن دبائیں (زیادہ سے زیادہ ۴)۔' },
  'compare.type': { en: 'Type', ur: 'قسم' },
  'compare.city': { en: 'City', ur: 'شہر' },
  'compare.rating': { en: 'Rating', ur: 'ریٹنگ' },
  'compare.startingPrice': { en: 'Starting price', ur: 'ابتدائی قیمت' },
  'compare.capacity': { en: 'Capacity', ur: 'گنجائش' },
  'compare.verified': { en: 'Verified', ur: 'تصدیق شدہ' },
  'compare.reliability': { en: 'Reliability', ur: 'قابلِ اعتماد' },
  'compare.viewProfile': { en: 'View profile', ur: 'پروفائل دیکھیں' },

  // Bookings
  'bookings.title': { en: 'My bookings', ur: 'میری بکنگز' },
  'bookings.signInTitle': { en: 'Sign in to see bookings', ur: 'بکنگز دیکھنے کے لیے سائن اِن کریں' },
  'bookings.signInSub': { en: 'Your bookings appear here once you sign in.', ur: 'سائن اِن کرنے پر آپ کی بکنگز یہاں ظاہر ہوں گی۔' },
  'bookings.loadError': { en: 'Couldn’t load bookings', ur: 'بکنگز لوڈ نہیں ہو سکیں' },
  'bookings.emptyTitle': { en: 'No bookings yet', ur: 'ابھی کوئی بکنگ نہیں' },
  'bookings.emptySub': { en: 'When you book a vendor, it’ll show up here. Start by exploring.', ur: 'جب آپ کسی وینڈر کو بک کریں گے تو وہ یہاں نظر آئے گا۔ تلاش سے آغاز کریں۔' },

  // Guides
  'guides.title': { en: 'Wedding guides', ur: 'شادی گائیڈز' },
  'guides.subtitle': { en: 'Everything you need to plan your shaadi — from costs to rasms.', ur: 'اپنی شادی کی منصوبہ بندی کے لیے سب کچھ — اخراجات سے رسموں تک۔' },

  // Vendor detail
  'detail.about': { en: 'ABOUT', ur: 'تعارف' },
  'detail.packages': { en: 'PACKAGES', ur: 'پیکجز' },
  'detail.services': { en: 'SERVICES & AMENITIES', ur: 'خدمات اور سہولیات' },
  'detail.gallery': { en: 'GALLERY', ur: 'گیلری' },
  'detail.reviews': { en: 'REVIEWS', ur: 'ریویوز' },
  'detail.availability': { en: 'AVAILABILITY', ur: 'دستیابی' },
  'detail.moreFromVendor': { en: 'More from this vendor', ur: 'اسی وینڈر سے مزید' },
  'detail.requestBooking': { en: 'Request booking', ur: 'بکنگ کی درخواست' },
  'detail.whatsapp': { en: 'WhatsApp', ur: 'واٹس ایپ' },
  'detail.call': { en: 'Call', ur: 'کال' },
  'detail.share': { en: 'Share', ur: 'شیئر' },
  'detail.notFound': { en: 'Vendor not found', ur: 'وینڈر نہیں ملا' },
  'detail.notFoundSub': { en: 'This listing may have been removed.', ur: 'ممکن ہے یہ لسٹنگ ہٹا دی گئی ہو۔' },
  'detail.newListing': { en: 'New listing', ur: 'نئی لسٹنگ' },
  'detail.askPrice': { en: 'Ask for a price', ur: 'قیمت پوچھیں' },
  'detail.startingFrom': { en: 'Starting from', ur: 'ابتدائی قیمت' },
  'detail.pricing': { en: 'Pricing', ur: 'قیمت' },
  'detail.reliability': { en: 'Reliability', ur: 'قابلِ اعتماد' },
  'detail.reviewsCount': { en: 'reviews', ur: 'ریویوز' },
  'detail.noReviews': { en: 'No reviews yet — be the first to review after your event.', ur: 'ابھی کوئی ریویو نہیں — اپنی تقریب کے بعد پہلا ریویو آپ دیں۔' },
  'detail.open': { en: 'Open', ur: 'دستیاب' },
  'detail.busy': { en: 'Busy', ur: 'مصروف' },
  'detail.confirmDate': { en: 'Message the vendor to confirm your date.', ur: 'اپنی تاریخ کی تصدیق کے لیے وینڈر کو پیغام بھیجیں۔' },

  // Booking request modal
  'booking.requestTitle': { en: 'Request a booking', ur: 'بکنگ کی درخواست' },
  'booking.sentTitle': { en: 'Request sent', ur: 'درخواست بھیج دی گئی' },
  'booking.sentBody': { en: 'Your booking request is sent. The vendor will confirm availability and details with you directly — weddings are settled with the vendor, no online payment needed.', ur: 'آپ کی بکنگ کی درخواست بھیج دی گئی ہے۔ وینڈر دستیابی اور تفصیلات کی تصدیق آپ سے براہِ راست کرے گا — شادیوں کا معاملہ وینڈر کے ساتھ طے ہوتا ہے، آن لائن ادائیگی کی ضرورت نہیں۔' },
  'booking.function': { en: 'FUNCTION', ur: 'تقریب' },
  'booking.eventDate': { en: 'Event date', ur: 'تقریب کی تاریخ' },
  'booking.guests': { en: 'GUESTS (approx.)', ur: 'مہمان (تقریباً)' },
  'booking.package': { en: 'PACKAGE (optional)', ur: 'پیکج (اختیاری)' },
  'booking.any': { en: 'Any', ur: 'کوئی بھی' },
  'booking.yourName': { en: 'Your name', ur: 'آپ کا نام' },
  'booking.phone': { en: 'Phone / WhatsApp', ur: 'فون / واٹس ایپ' },
  'booking.anythingElse': { en: 'Anything else? (optional)', ur: 'کچھ اور؟ (اختیاری)' },
  'booking.send': { en: 'Send booking request', ur: 'بکنگ کی درخواست بھیجیں' },
  'booking.noPayment': { en: 'No payment now — the vendor confirms and you settle directly.', ur: 'ابھی کوئی ادائیگی نہیں — وینڈر تصدیق کرے گا اور آپ براہِ راست ادائیگی کریں گے۔' },
  'booking.errContact': { en: 'Please add your name or phone so the vendor can reach you.', ur: 'براہِ کرم اپنا نام یا فون شامل کریں تاکہ وینڈر آپ سے رابطہ کر سکے۔' },
  'booking.errSend': { en: 'Couldn’t send your request. Please try again.', ur: 'آپ کی درخواست نہیں بھیجی جا سکی۔ دوبارہ کوشش کریں۔' },

  // Auth
  'auth.welcomeBack': { en: 'Welcome back', ur: 'خوش آمدید' },
  'auth.signInSub': { en: 'Sign in to save vendors, message & book.', ur: 'وینڈرز محفوظ کرنے، پیغام اور بکنگ کے لیے سائن اِن کریں۔' },
  'auth.createAccount': { en: 'Create your account', ur: 'اپنا اکاؤنٹ بنائیں' },
  'auth.registerSub': { en: 'Plan your shaadi with Wedding Wala.', ur: 'ویڈنگ والا کے ساتھ اپنی شادی کی منصوبہ بندی کریں۔' },
  'auth.email': { en: 'Email', ur: 'ای میل' },
  'auth.password': { en: 'Password', ur: 'پاس ورڈ' },
  'auth.fullName': { en: 'Full name', ur: 'پورا نام' },
  'auth.phone': { en: 'Phone / WhatsApp', ur: 'فون / واٹس ایپ' },
  'auth.createBtn': { en: 'Create account', ur: 'اکاؤنٹ بنائیں' },
  'auth.newHere': { en: 'New here?', ur: 'نئے ہیں؟' },
  'auth.alreadyHave': { en: 'Already have an account?', ur: 'پہلے سے اکاؤنٹ ہے؟' },
  'auth.createLink': { en: 'Create an account', ur: 'اکاؤنٹ بنائیں' },
  'auth.showPassword': { en: 'Show password', ur: 'پاس ورڈ دکھائیں' },
  'auth.hidePassword': { en: 'Hide password', ur: 'پاس ورڈ چھپائیں' },
  'auth.confirmPassword': { en: 'Confirm password', ur: 'پاس ورڈ کی تصدیق' },
  'auth.errEmailPassword': { en: 'Enter your email and password.', ur: 'اپنا ای میل اور پاس ورڈ درج کریں۔' },
  'auth.err2fa': { en: 'Two-factor is enabled on this account. Please sign in on weddingwala.pk for now.', ur: 'اس اکاؤنٹ پر ٹو-فیکٹر فعال ہے۔ فی الحال براہِ کرم weddingwala.pk پر سائن اِن کریں۔' },
  'auth.errSignIn': { en: 'Sign in failed. Please try again.', ur: 'سائن اِن ناکام۔ دوبارہ کوشش کریں۔' },
  'auth.errAllFields': { en: 'Please fill in all fields.', ur: 'براہِ کرم تمام خانے پُر کریں۔' },
  'auth.errPwLen': { en: 'Password must be at least 8 characters.', ur: 'پاس ورڈ کم از کم ۸ حروف کا ہونا چاہیے۔' },
  'auth.errPwMatch': { en: 'Passwords don’t match.', ur: 'پاس ورڈ مماثل نہیں ہیں۔' },
  'auth.errSignUp': { en: 'Sign up failed. Please try again.', ur: 'رجسٹریشن ناکام۔ دوبارہ کوشش کریں۔' },
} as const satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, locale: Locale): string {
  const entry = STRINGS[key];
  return entry[locale] ?? entry.en;
}
