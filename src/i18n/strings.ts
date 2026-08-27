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
  'common.dismiss': { en: 'Dismiss', ur: 'بند کریں' },
  'common.yes': { en: 'Yes', ur: 'ہاں' },
  'common.no': { en: 'No', ur: 'نہیں' },
  // The em-dash placeholder for a column the vendor never filled in. ~98% of
  // listings are unclaimed OSM imports, so this is the COMMON cell, not an edge
  // case — it is a string a customer reads and belongs in the string file.
  'common.notGiven': { en: '—', ur: '—' },

  // Account
  'account.title': { en: 'Account', ur: 'اکاؤنٹ' },
  'account.guest': { en: 'Guest', ur: 'مہمان' },
  'account.signedIn': { en: 'Signed in', ur: 'سائن اِن' },
  'account.signInPrompt': { en: 'Sign in to save vendors & book', ur: 'وینڈرز محفوظ کرنے اور بکنگ کے لیے سائن اِن کریں' },
  'account.myBookings': { en: 'My bookings', ur: 'میری بکنگز' },
  'account.editProfile': { en: 'Edit profile', ur: 'پروفائل میں ترمیم' },
  'account.language': { en: 'Language', ur: 'زبان' },
  'account.tagline': { en: "Wedding Wala — Pakistan's #1 shaadi platform.", ur: 'ویڈنگ والا — پاکستان کا نمبر ۱ شادی پلیٹ فارم۔' },
  // Account / settings hub
  'acct.activity': { en: 'My activity', ur: 'میری سرگرمی' },
  'acct.planning': { en: 'Planning', ur: 'منصوبہ بندی' },
  'acct.preferences': { en: 'Preferences', ur: 'ترجیحات' },
  'acct.support': { en: 'Support', ur: 'معاونت' },
  'acct.about': { en: 'About', ur: 'تعارف' },
  'acct.notifications': { en: 'Notifications', ur: 'اطلاعات' },
  'acct.currency': { en: 'Currency', ur: 'کرنسی' },
  'acct.help': { en: 'Help & guides', ur: 'مدد اور گائیڈز' },
  'acct.contact': { en: 'Contact us', ur: 'ہم سے رابطہ' },
  'acct.share': { en: 'Share Wedding Wala', ur: 'ویڈنگ والا شیئر کریں' },
  'acct.rate': { en: 'Rate the app', ur: 'ایپ کو ریٹ کریں' },
  'acct.aboutWW': { en: 'About Wedding Wala', ur: 'ویڈنگ والا کے بارے میں' },
  'acct.terms': { en: 'Terms of use', ur: 'شرائطِ استعمال' },
  'acct.privacy': { en: 'Privacy policy', ur: 'رازداری پالیسی' },
  'acct.version': { en: 'Version', ur: 'ورژن' },

  // Plan
  'plan.title': { en: 'Plan your shaadi', ur: 'اپنی شادی کی منصوبہ بندی' },
  'plan.subtitle': { en: 'Everything for the big day, in one place.', ur: 'بڑے دن کی ہر چیز، ایک جگہ۔' },
  'plan.shortlist': { en: 'Your shortlist', ur: 'آپ کی شارٹ لسٹ' },
  'plan.tools': { en: 'Planning tools', ur: 'منصوبہ بندی کے ٹولز' },
  'plan.savedNote': { en: 'Your plans are saved on this device.', ur: 'آپ کے منصوبے اسی ڈیوائس پر محفوظ ہیں۔' },
  // Stat suffixes for the four planning tools. These were built inline as
  // English literals — "2/8 done", "120 guests", "6 events" — on a tab that is
  // otherwise fully translated.
  'plan.statDone': { en: 'done', ur: 'مکمل' },
  'plan.statEvents': { en: 'events', ur: 'تقریبات' },
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
  'home.featuredThisWeek': { en: 'FEATURED THIS WEEK', ur: 'اس ہفتے کی نمایاں' },
  'home.weddingGuides': { en: 'Wedding guides', ur: 'شادی گائیڈز' },
  'home.guidesSub': { en: 'Costs, rasms, choosing vendors & more', ur: 'اخراجات، رسمیں، وینڈرز کا انتخاب اور مزید' },
  'home.threeSteps': { en: 'Three steps to your shaadi', ur: 'آپ کی شادی کے تین مراحل' },
  'home.liveNote': { en: 'Every vendor here is live from the same platform as weddingwala.pk.', ur: 'یہاں ہر وینڈر weddingwala.pk کے اسی پلیٹ فارم سے براہِ راست ہے۔' },
  'home.step1Title': { en: 'Discover', ur: 'دریافت کریں' },
  /**
   * Was: "Browse 3,000+ TRUSTED vendors". Two problems, both truth problems.
   * The count was baked into a translation string, so it could only ever drift
   * from the real total (3,284 today, from `/platform-stats`). And "trusted" is a
   * claim the data does not support: of 60 venues on production page 1, exactly
   * one has `verificationTier > 0` and three have any review at all (blocker B4).
   * The live count now renders separately from the live endpoint, and the word
   * that we cannot stand behind is gone.
   */
  'home.step1Body': { en: 'Browse vendors by category, city, budget and rating.', ur: 'وینڈرز کو زمرہ، شہر، بجٹ اور ریٹنگ کے لحاظ سے دیکھیں۔' },
  'home.step2Title': { en: 'Shortlist & compare', ur: 'شارٹ لسٹ اور موازنہ' },
  'home.step2Body': { en: 'Save your favourites and compare them side by side.', ur: 'اپنے پسندیدہ محفوظ کریں اور ساتھ ساتھ موازنہ کریں۔' },
  'home.step3Title': { en: 'Connect', ur: 'رابطہ کریں' },
  'home.step3Body': { en: 'Message vendors on WhatsApp or request a booking — no middleman.', ur: 'وینڈرز کو واٹس ایپ پر پیغام بھیجیں یا بکنگ کی درخواست کریں — بغیر کسی بیچ والے کے۔' },

  // Home — S1. Every one of these was previously an inline `isUrdu ? … : …`
  // ternary inside a component, which is prohibition 3 in rules.md: a string a
  // customer can read that never reaches the translation file.
  'home.greeting': { en: 'Assalam-o-Alaikum', ur: 'السلام علیکم' },
  'home.heroTop': { en: 'Find your', ur: 'اپنا' },
  'home.heroAccent': { en: 'perfect', ur: 'خاص دن' },
  'home.heroTail': { en: 'day', ur: 'تلاش کریں' },
  // Urdu is set in Nastaliq, which is materially wider than Latin at the same
  // size — the literal translation clipped to "وینیو، فوٹوگراف…" inside the
  // field. A translation that fits is worth more than one that matches
  // word-for-word, so the Urdu is shorter by design rather than truncated.
  'home.searchHint': { en: 'Venues, photographers…', ur: 'وینڈرز تلاش کریں…' },
  'home.filtersLabel': { en: 'Filters', ur: 'فلٹرز' },
  'home.browseCategoryTitle': { en: 'Browse by category', ur: 'زمرے کے لحاظ سے' },
  'home.browseCityTitle': { en: 'Browse by city', ur: 'شہر کے لحاظ سے' },
  'home.featuredTitle': { en: 'Featured this week', ur: 'اس ہفتے کی نمایاں' },
  'home.savedLabel': { en: 'Saved', ur: 'محفوظ شدہ' },
  'home.pullToRefresh': { en: 'Refreshing…', ur: 'تازہ ہو رہا ہے…' },

  // The featured card. Facts only — every one maps to a column on the business
  // row, and the card hides any line whose column is null.
  'home.verified': { en: 'Verified', ur: 'تصدیق شدہ' },
  'home.hostedBy': { en: 'Hosted by', ur: 'میزبان' },
  'home.yearsHosting': { en: 'years hosting', ur: 'سال سے' },
  'home.weddingsHosted': { en: 'weddings', ur: 'شادیاں' },
  'home.guestsRange': { en: 'guests', ur: 'مہمان' },
  'home.reviewsShort': { en: 'reviews', ur: 'ریویوز' },
  'home.viewVendor': { en: 'View this vendor', ur: 'یہ وینڈر دیکھیں' },
  'home.startingFrom': { en: 'Starting from', ur: 'ابتدائی قیمت' },
  // The rail titled "Featured venues" was rendering `slug="wedding-decorators"`,
  // so a section promising venues listed "DÉCOR · Zeeshan Decoration Service".
  // Found by reading the network log against the screen. Décor now has its own
  // honest title, and the venues rail shows venues.
  'home.decorators': { en: 'Décor & staging', ur: 'ڈیکور اور اسٹیج' },

  // Explore
  // Chat — the vendor conversation. The backend has had /chat/* live all along;
  // the app had no way in, so every conversation left for WhatsApp on tap one.
  // The hero. The countdown is the one genuinely personal, genuinely true fact
  // we can put on this screen — see store/wedding.ts.
  'home.daysToShaadi': { en: 'days to your shaadi', ur: 'دن آپ کی شادی میں' },
  'home.dayToShaadi': { en: 'day to your shaadi', ur: 'دن آپ کی شادی میں' },
  'home.shaadiToday': { en: 'Your shaadi is today', ur: 'آج آپ کی شادی ہے' },
  'home.shaadiPassed': { en: 'We hope it was beautiful', ur: 'امید ہے بہت خوبصورت رہی' },
  'home.setDate': { en: 'Set your wedding date', ur: 'اپنی شادی کی تاریخ منتخب کریں' },
  'home.setDateSub': { en: 'See who is free, and how long you have.', ur: 'دیکھیں کون دستیاب ہے اور کتنا وقت باقی ہے۔' },
  'home.changeDate': { en: 'Change', ur: 'تبدیل کریں' },
  'home.dateLocalNote': { en: 'Saved on this device only.', ur: 'صرف اسی ڈیوائس پر محفوظ۔' },
  'home.savedCount': { en: 'saved', ur: 'محفوظ' },

  'home.savedVendors': { en: 'saved', ur: 'محفوظ' },
  'home.startHere': { en: 'Start here', ur: 'یہاں سے شروع کریں' },
  'home.peakSeason': { en: 'Peak shaadi season', ur: 'شادی کا عروج' },
  'home.offSeason': { en: 'Quieter season — better rates', ur: 'کم مصروف موسم — بہتر نرخ' },

  'home.venuesTitle': { en: 'Wedding venues', ur: 'شادی ہال' },
  'home.venuesSub': { en: 'The booking every other vendor is planned around.', ur: 'وہ بکنگ جس کے گرد باقی سب طے ہوتا ہے۔' },

  'detail.menus': { en: 'Menus', ur: 'مینیو' },
  'detail.sendInquiry': { en: 'Send an inquiry', ur: 'استفسار بھیجیں' },
  'detail.sendInquirySub': { en: 'Tell them about your event and they’ll get back to you.', ur: 'اپنی تقریب کے بارے میں بتائیں، وہ آپ سے رابطہ کریں گے۔' },
  'detail.perHead': { en: 'per head', ur: 'فی فرد' },
  'detail.minGuests': { en: 'Minimum', ur: 'کم از کم' },
  'detail.minGuestsNote': { en: 'You are billed for this many guests even if fewer attend.', ur: 'کم مہمان آنے پر بھی اتنے ہی کا بل آئے گا۔' },

  // Booking flow — S6.
  'booking.dateTitle': { en: 'Pick your date', ur: 'اپنی تاریخ منتخب کریں' },
  'booking.pickDateFirst': { en: 'Choose a date to see which times are free.', ur: 'دستیاب اوقات دیکھنے کے لیے تاریخ منتخب کریں۔' },
  'booking.continue': { en: 'Continue', ur: 'جاری رکھیں' },

  'booking.guestsLabel': { en: 'Guests', ur: 'مہمان' },
  'booking.phoneLabel': { en: 'Phone number', ur: 'فون نمبر' },
  'booking.confirmTitle': { en: 'Confirm your booking', ur: 'اپنی بکنگ کی تصدیق کریں' },
  'booking.yourDetails': { en: 'Your details', ur: 'آپ کی تفصیلات' },
  'booking.name': { en: 'Full name', ur: 'پورا نام' },
  'booking.email': { en: 'Email', ur: 'ای میل' },
  'booking.notes': { en: 'Anything the vendor should know?', ur: 'وینڈر کو کچھ بتانا ہے؟' },
  'booking.notesHint': { en: 'Rasm, timings, dietary needs — optional.', ur: 'رسم، اوقات، کھانے کی ضروریات — اختیاری۔' },
  'booking.total': { en: 'Total', ur: 'کل' },
  'booking.advance': { en: 'Advance to confirm', ur: 'تصدیق کے لیے پیشگی' },
  'booking.balance': { en: 'Balance on the day', ur: 'باقی رقم تقریب کے دن' },
  'booking.costTitle': { en: 'What it costs', ur: 'اخراجات' },
  'booking.pkgLine': { en: 'Package', ur: 'پیکج' },
  // Used when NO package is chosen and the total falls back to the vendor's
  // `minimumPrice`. Calling that "Package" names a package the customer has
  // not picked, and the figure changes the moment they pick one.
  'booking.startingLine': { en: 'Starting price', ur: 'ابتدائی قیمت' },
  'booking.requestBooking': { en: 'Request booking', ur: 'بکنگ کی درخواست' },
  'booking.requestNote': { en: 'This sends a request. The vendor confirms before anything is owed.', ur: 'یہ صرف درخواست ہے۔ وینڈر کی تصدیق سے پہلے کچھ واجب نہیں۔' },
  'booking.failed': { en: 'Could not send your request. Try again.', ur: 'درخواست نہیں بھیجی جا سکی۔ دوبارہ کوشش کریں۔' },
  'booking.doneTitle': { en: 'Request sent', ur: 'درخواست بھیج دی گئی' },
  'booking.doneBody': { en: 'The vendor will confirm shortly. You can track it in My bookings.', ur: 'وینڈر جلد تصدیق کرے گا۔ آپ اسے میری بکنگز میں دیکھ سکتے ہیں۔' },
  'booking.viewBookings': { en: 'View my bookings', ur: 'میری بکنگز دیکھیں' },
  'booking.ref': { en: 'Reference', ur: 'حوالہ' },

  'detail.specs': { en: 'Details', ur: 'تفصیلات' },

  'detail.prevMonth': { en: 'Previous month', ur: 'پچھلا مہینہ' },
  'detail.nextMonth': { en: 'Next month', ur: 'اگلا مہینہ' },

  'chat.title': { en: 'Chat', ur: 'گفتگو' },
  // ── FormField placeholders ──────────────────────────────────────────────
  // These were English literals on fields whose LABELS were translated, so an
  // Urdu form read as an Urdu label above a Latin hint inside the input.
  'ph.fullName': { en: 'Full name', ur: 'پورا نام' },
  'ph.guestName': { en: 'Ahmed & family', ur: 'احمد اور اہلِ خانہ' },
  'ph.budgetItem': { en: 'Barat hall', ur: 'بارات ہال' },
  'ph.checklistTask': { en: 'Book dhol players', ur: 'ڈھول والے بک کریں' },
  'ph.timelineEvent': { en: 'Nikah ceremony', ur: 'نکاح کی تقریب' },
  'ph.timelineLocation': { en: 'Main hall', ur: 'مرکزی ہال' },
  'chat.placeholder': { en: 'Write a message…', ur: 'پیغام لکھیں…' },
  'chat.send': { en: 'Send', ur: 'بھیجیں' },
  'chat.emptyTitle': { en: 'Start the conversation', ur: 'گفتگو شروع کریں' },
  'chat.emptyBody': { en: 'Ask about your date, guest count or what a package includes.', ur: 'اپنی تاریخ، مہمانوں کی تعداد یا پیکج کے بارے میں پوچھیں۔' },
  'chat.signInFirst': { en: 'Sign in to message this vendor', ur: 'پیغام بھیجنے کے لیے سائن اِن کریں' },
  'chat.unavailable': { en: 'This vendor cannot be messaged yet', ur: 'اس وینڈر کو ابھی پیغام نہیں بھیجا جا سکتا' },
  'chat.sendFailed': { en: 'Message not sent. Tap send to try again.', ur: 'پیغام نہیں بھیجا جا سکا۔ دوبارہ بھیجنے کے لیے دبائیں۔' },
  'detail.chat': { en: 'Chat', ur: 'گفتگو' },
  // Screen-reader labels. These were English literals on controls that repeat
  // — the heart appears once per card, so an Urdu customer running TalkBack
  // heard "Save" twelve times down one screen of Urdu vendor names.
  // "On request" — what a price is when the vendor never entered one, which is
  // ~98% of listings. `PackageTiles` already had the Urdu inline; it lives here
  // now so there is one wording rather than two.
  'price.from': { en: 'From', ur: 'شروع' },
  'price.onRequest': { en: 'On request', ur: 'قیمت پوچھیں' },
  'trust.rating': { en: 'Rating', ur: 'ریٹنگ' },
  'trust.status': { en: 'Status', ur: 'حیثیت' },
  'trust.reviews': { en: 'Reviews', ur: 'ریویوز' },
  // VendorHostCard. Every one of these was an inline `urdu ? '…' : '…'` in the
  // component — the fourth place in the app carrying its own translations.
  // The four-fact spec strip under the vendor title. These were English
  // literals inside `buildSpecs`, so the densest, highest-placed row of facts on
  // the vendor page read "Seated / Parking / Advance / Years" in Latin under an
  // Urdu title, beside an Urdu price.
  // The availability legend. `Calendar` carried these as inline
  // `urdu ? '…' : '…'` ternaries — the fifth component in the app doing that.
  // The booking time slots. The four legacy periods were English literals that
  // doubled as the STORED `label` on a booking, so they could not simply be
  // translated in place — the display is keyed off the slot's `value`, which is
  // its identity, and the stored label is untouched.
  // ── API errors ──────────────────────────────────────────────────────────
  // Every message the API layer generates itself was a hardcoded English
  // string, and the six screens that display one all preferred it over their
  // own translated fallback. So the copy an Urdu customer saw at the exact
  // moment something went wrong — a failed sign-in, a failed booking, a dropped
  // message — was the one piece of copy in the app guaranteed to be English.
  'err.network': {
    en: 'Can’t reach the server. Check your connection and try again.',
    ur: 'سرور سے رابطہ نہیں ہو سکا۔ اپنا انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔',
  },
  'err.cancelled': { en: 'Request cancelled', ur: 'درخواست منسوخ کر دی گئی' },
  'err.unknown': { en: 'Something went wrong.', ur: 'کچھ گڑبڑ ہو گئی۔' },
  'err.expired': {
    en: 'Your session has expired. Please sign in again.',
    ur: 'آپ کا سیشن ختم ہو گیا۔ دوبارہ سائن اِن کریں۔',
  },
  'err.forbidden': { en: 'You don’t have access to this.', ur: 'آپ کو اس کی اجازت نہیں۔' },
  'err.notFound': { en: 'Not found.', ur: 'کچھ نہیں ملا۔' },
  'err.server': {
    en: 'The server had a problem. Please try again shortly.',
    ur: 'سرور میں مسئلہ ہے۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔',
  },
  'err.failed': { en: 'Request failed.', ur: 'درخواست ناکام رہی۔' },
  // ── Booking phase ───────────────────────────────────────────────────────
  // The badge on each row of the bookings list showed `booking.status` RAW —
  // the backend's own string, on an Urdu screen: "Awaiting Payment",
  // "Cancelled", "Completed", "Pending". The file already derives a closed
  // phase for the badge's COLOUR and simply did not use it for the label.
  'phase.requested': { en: 'Requested', ur: 'درخواست بھیجی گئی' },
  'phase.awaitingPayment': { en: 'Awaiting payment', ur: 'ادائیگی باقی' },
  'phase.confirmed': { en: 'Confirmed', ur: 'تصدیق شدہ' },
  'phase.paid': { en: 'Paid', ur: 'ادائیگی ہو گئی' },
  'phase.complete': { en: 'Completed', ur: 'مکمل' },
  'phase.cancelled': { en: 'Cancelled', ur: 'منسوخ' },
  'slot.wholeDay': { en: 'Whole day', ur: 'پورا دن' },
  'slot.morning': { en: 'Morning', ur: 'صبح' },
  'slot.midday': { en: 'Midday', ur: 'دوپہر' },
  'slot.evening': { en: 'Evening', ur: 'شام' },
  // "3 of 8 left" — the free/capacity line on a slot row. Word order differs
  // between the languages, so this is two whole sentences, not a shared
  // template with the numbers swapped in.
  'slot.freeOfCapacity': { en: 'of', ur: 'میں' },
  'slot.left': { en: 'left', ur: 'باقی' },
  'slot.to': { en: 'to', ur: 'تا' },
  'slot.booked': { en: 'Booked', ur: 'بک ہو گیا' },
  'slot.upTo': { en: 'Up to', ur: 'زیادہ سے زیادہ' },
  'cal.available': { en: 'Available', ur: 'دستیاب' },
  'cal.limited': { en: 'Limited', ur: 'محدود' },
  'cal.booked': { en: 'Booked', ur: 'بک شدہ' },
  'spec.seated': { en: 'Seated', ur: 'نشستیں' },
  'spec.parking': { en: 'Parking', ur: 'پارکنگ' },
  'spec.advance': { en: 'Advance', ur: 'پیشگی' },
  'spec.years': { en: 'Years', ur: 'سال' },
  'host.hostedBy': { en: 'HOSTED BY', ur: 'میزبان' },
  'host.readMore': { en: 'Read more', ur: 'مزید پڑھیں' },
  'host.showLess': { en: 'Show less', ur: 'کم دکھائیں' },
  'host.year': { en: 'year', ur: 'سال' },
  'host.years': { en: 'years', ur: 'سال' },
  'host.weddings': { en: 'weddings', ur: 'شادیاں' },
  'trust.elite': { en: 'Elite', ur: 'ایلیٹ' },
  'trust.verified': { en: 'Verified', ur: 'تصدیق شدہ' },
  'common.close': { en: 'Close', ur: 'بند کریں' },
  'common.clear': { en: 'Clear', ur: 'صاف کریں' },
  'common.saved': { en: 'Saved', ur: 'محفوظ ہے' },
  'common.back': { en: 'Back', ur: 'واپس' },

  'explore.title': { en: 'Explore', ur: 'تلاش' },
  'explore.searchPlaceholder': { en: 'Search vendors, cities…', ur: 'وینڈرز، شہر تلاش کریں…' },
  'explore.vendorsCount': { en: 'vendors', ur: 'وینڈرز' },
  'explore.filters': { en: 'Filters', ur: 'فلٹرز' },
  'explore.loadingAll': { en: 'Loading all matching vendors…', ur: 'تمام متعلقہ وینڈرز لوڈ ہو رہے ہیں…' },
  'explore.loadError': { en: 'Couldn’t load vendors', ur: 'وینڈرز لوڈ نہیں ہو سکے' },
  'explore.loadErrorSub': { en: 'Check your connection and try again.', ur: 'اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں۔' },
  'explore.noMatch': { en: 'No vendors match', ur: 'کوئی وینڈر نہیں ملا' },
  'explore.noMatchSub': { en: 'Try widening your budget, clearing a filter, or a different category.', ur: 'اپنا بجٹ بڑھائیں، کوئی فلٹر ہٹائیں، یا مختلف زمرہ آزمائیں۔' },

  // ── Filter sheet ─────────────────────────────────────────────────────────
  // Every string on this sheet was hardcoded English, in an app that ships an
  // Urdu interface. A customer who switches to اردو got a fully translated
  // Explore screen and then a filter sheet entirely in English — which is the
  // same defect as the inquiry form had, on the screen with the most controls.
  'filter.title': { en: 'Filters', ur: 'فلٹرز' },
  'filter.sortBy': { en: 'Sort by', ur: 'ترتیب دیں' },
  'filter.budget': { en: 'Budget', ur: 'بجٹ' },
  'filter.budgetAny': { en: 'any', ur: 'کوئی حد نہیں' },
  'filter.budgetUpTo': { en: 'up to', ur: 'زیادہ سے زیادہ' },
  'filter.rating': { en: 'Minimum rating', ur: 'کم از کم ریٹنگ' },
  'filter.capacity': { en: 'Guest capacity', ur: 'مہمانوں کی گنجائش' },
  'filter.city': { en: 'City', ur: 'شہر' },
  'filter.allCities': { en: 'All cities', ur: 'تمام شہر' },
  'filter.showOnly': { en: 'Show only', ur: 'صرف دکھائیں' },
  'filter.amenities': { en: 'Amenities', ur: 'سہولیات' },
  'filter.any': { en: 'Any', ur: 'کوئی بھی' },
  'filter.verified': { en: 'Verified vendors', ur: 'تصدیق شدہ وینڈرز' },
  'filter.featured': { en: 'Featured', ur: 'نمایاں' },
  'filter.available': { en: 'Available (not on vacation)', ur: 'دستیاب (چھٹی پر نہیں)' },
  // Short forms for the removable active-filter chips. `filter.verified` and
  // `filter.available` are sentences ("Verified vendors", "Available (not on
  // vacation)") because they label a switch inside the filter sheet; a chip has
  // room for one word.
  'filter.verifiedChip': { en: 'Verified', ur: 'تصدیق شدہ' },
  'filter.availableChip': { en: 'Available', ur: 'دستیاب' },
  // The price histogram. These lived INSIDE PriceHistogram as
  // `urdu ? '...' : '...'` ternaries — the only component in the app carrying
  // its own translations, which meant its Urdu could never be reviewed beside
  // everything else's, and `urdu` meant "pick a language" there while it means
  // "pick a font" in every other component.
  'filter.noPrices': {
    en: 'No vendors in this selection have listed a price',
    ur: 'اس انتخاب میں کسی وینڈر نے قیمت درج نہیں کی',
  },
  // Shown when the chart is drawn over the vendors loaded SO FAR rather than the
  // whole catalogue. Without it the histogram states a number about 12 vendors
  // in the voice of a number about 3,274.
  'filter.sampledPrefix': { en: 'Of the', ur: 'اب تک لوڈ ہوئے' },
  'filter.sampledSuffix': { en: 'vendors loaded so far', ur: 'وینڈرز میں سے' },
  'filter.unpricedSuffix': { en: 'vendors have no price listed', ur: 'وینڈرز کی قیمت درج نہیں' },
  'filter.reset': { en: 'Reset', ur: 'ری سیٹ' },
  'filter.apply': { en: 'Apply', ur: 'لاگو کریں' },

  // ── Draft resume ─────────────────────────────────────────────────────────
  // These were inline `urdu ? '…' : '…'` ternaries inside the component, which
  // is prohibition 3 in rules.md: a string a customer can read that never
  // reaches the translation file, so it cannot be reviewed, corrected or found.
  'draft.title': { en: 'You have an unfinished form', ur: 'ادھورا فارم محفوظ ہے' },
  'draft.savedPrefix': { en: 'Saved', ur: 'محفوظ کیا گیا' },
  'draft.resume': { en: 'Resume', ur: 'جاری رکھیں' },
  'draft.discard': { en: 'Discard draft', ur: 'ڈرافٹ حذف کریں' },
  // Sort labels. Keyed off `SORT_OPTIONS[].value` so the option list stays the
  // single source of the VALUES and only the wording localises — the same split
  // the inquiry sheet uses for `eventType`.
  'sort.relevance': { en: 'Relevance', ur: 'مطابقت' },
  'sort.rating': { en: 'Highest rated', ur: 'بہترین ریٹنگ' },
  'sort.price_asc': { en: 'Price: low to high', ur: 'قیمت: کم سے زیادہ' },
  'sort.price_desc': { en: 'Price: high to low', ur: 'قیمت: زیادہ سے کم' },
  'sort.name': { en: 'A–Z', ur: 'حروفِ تہجی' },
  'sort.recent': { en: 'Most recent', ur: 'حالیہ ترین' },

  // Inbox
  'inbox.title': { en: 'Inbox', ur: 'پیغامات' },
  'inbox.markAllRead': { en: 'Mark all read', ur: 'سب پڑھا ہوا نشان زد کریں' },
  'inbox.signInTitle': { en: 'Sign in for your inbox', ur: 'اپنے پیغامات کے لیے سائن اِن کریں' },
  'inbox.signInSub': { en: 'Booking updates and vendor messages appear here.', ur: 'بکنگ اپڈیٹس اور وینڈر پیغامات یہاں ظاہر ہوں گے۔' },
  'inbox.emptyTitle': { en: 'You’re all caught up', ur: 'آپ نے سب دیکھ لیا' },
  'inbox.emptySub': { en: 'Booking updates and messages will appear here.', ur: 'بکنگ اپڈیٹس اور پیغامات یہاں ظاہر ہوں گے۔' },
  'inbox.fallbackTitle': { en: 'Notification', ur: 'اطلاع' },
  'inbox.unread': { en: 'unread', ur: 'غیر پڑھے' },
  // Relative time. `relTime` built these as English literals — "just now",
  // "5m ago", "2h ago" — inside the component, on a bilingual screen.
  // Urdu spells the unit out: "5m" is a Latin abbreviation that means nothing
  // in Nastaliq, and there is room for the word on a single meta line.
  'time.now': { en: 'just now', ur: 'ابھی' },
  'time.minutes': { en: 'm ago', ur: 'منٹ پہلے' },
  'time.hours': { en: 'h ago', ur: 'گھنٹے پہلے' },
  'time.days': { en: 'd ago', ur: 'دن پہلے' },

  // Favourites
  'fav.title': { en: 'Saved', ur: 'محفوظ' },
  'fav.emptyTitle': { en: 'No saved vendors yet', ur: 'ابھی کوئی محفوظ وینڈر نہیں' },
  'fav.emptySub': { en: 'Tap the heart on any vendor to shortlist them here.', ur: 'کسی بھی وینڈر پر دل دبائیں تاکہ وہ یہاں شارٹ لسٹ ہو جائے۔' },
  // Lowercase, because it follows a count: "4 saved vendors", not the
  // "4 Saved vendors" you get from reusing the standalone menu label.
  'fav.countSuffix': { en: 'saved vendors', ur: 'محفوظ وینڈرز' },

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
  // The floating tray bar. All three of its strings were hardcoded English on
  // a screen the Urdu interface reaches from every vendor card.
  'compare.toCompare': { en: 'to compare', ur: 'موازنے کے لیے' },
  'compare.comparing': { en: 'Comparing', ur: 'موازنے میں' },
  'compare.clear': { en: 'Clear', ur: 'ہٹا دیں' },

  // Bookings
  'bookings.title': { en: 'My bookings', ur: 'میری بکنگز' },
  'bookings.signInTitle': { en: 'Sign in to see bookings', ur: 'بکنگز دیکھنے کے لیے سائن اِن کریں' },
  'bookings.signInSub': { en: 'Your bookings appear here once you sign in.', ur: 'سائن اِن کرنے پر آپ کی بکنگز یہاں ظاہر ہوں گی۔' },
  'bookings.loadError': { en: 'Couldn’t load bookings', ur: 'بکنگز لوڈ نہیں ہو سکیں' },
  'bookings.emptyTitle': { en: 'No bookings yet', ur: 'ابھی کوئی بکنگ نہیں' },
  'bookings.emptySub': { en: 'When you book a vendor, it’ll show up here. Start by exploring.', ur: 'جب آپ کسی وینڈر کو بک کریں گے تو وہ یہاں نظر آئے گا۔ تلاش سے آغاز کریں۔' },
  'bookings.ref': { en: 'Reference', ur: 'ریفرنس' },
  'bookings.viewVendor': { en: 'View vendor', ur: 'وینڈر دیکھیں' },
  'bookings.paid': { en: 'Paid', ur: 'ادا شدہ' },
  'bookings.due': { en: 'Still due', ur: 'باقی واجب' },
  'bookings.count': { en: 'booking', ur: 'بکنگ' },
  'bookings.countPlural': { en: 'bookings', ur: 'بکنگز' },
  // The four steps of a booking's life. Wording matches the vendor portal, so a
  // customer reading "Awaiting payment" is reading the same words their vendor
  // is looking at — a mismatch here turns into a phone call.
  'bookings.stepRequested': { en: 'Request sent', ur: 'درخواست بھیجی گئی' },
  'bookings.stepConfirmed': { en: 'Vendor confirmed', ur: 'وینڈر نے تصدیق کی' },
  'bookings.stepPaid': { en: 'Advance received', ur: 'پیشگی موصول' },
  'bookings.stepComplete': { en: 'Event complete', ur: 'تقریب مکمل' },
  'bookings.stepCancelled': { en: 'Cancelled', ur: 'منسوخ' },
  'bookings.stepWaitingVendor': { en: 'Waiting on the vendor', ur: 'وینڈر کے جواب کا انتظار' },

  // ── Cancelling ──────────────────────────────────────────────────────────
  // A customer cancelling a wedding booking is not clicking a button, they are
  // making a money decision under stress. Every string here names a number or
  // an outcome; none of them says "are you sure".
  'bookings.cancel': { en: 'Cancel booking', ur: 'بکنگ منسوخ کریں' },
  'bookings.cancelTitle': { en: 'Cancel this booking?', ur: 'یہ بکنگ منسوخ کریں؟' },
  'bookings.cancelIrreversible': {
    en: 'This cannot be undone. The date is released back to the vendor.',
    ur: 'یہ واپس نہیں ہو سکتا۔ تاریخ وینڈر کو واپس مل جائے گی۔',
  },
  'bookings.cancelChecking': { en: 'Checking your refund…', ur: 'آپ کی رقم کی واپسی دیکھی جا رہی ہے…' },
  'bookings.refundYouGetBack': { en: 'You’ll get back', ur: 'آپ کو واپس ملے گا' },
  'bookings.refundForfeited': { en: 'Forfeited under the vendor’s policy', ur: 'وینڈر کی پالیسی کے تحت ضبط' },
  'bookings.refundPaidSoFar': { en: 'Paid so far', ur: 'اب تک ادا شدہ' },
  // Composed around the day count — `useT` has no interpolation, so the screen
  // joins these two around the number rather than shipping a template.
  'bookings.refundDaysPre': { en: 'Cancelling', ur: 'تقریب سے' },
  'bookings.refundDaysPostOne': { en: 'day before the event.', ur: 'دن پہلے منسوخ کیا جا رہا ہے۔' },
  'bookings.refundDaysPost': { en: 'days before the event.', ur: 'دن پہلے منسوخ کیا جا رہا ہے۔' },
  'bookings.refundToday': { en: 'Cancelling on the day of the event.', ur: 'تقریب کے دن منسوخ کیا جا رہا ہے۔' },
  // Shown when nothing was ever paid — a Rs 0 refund row would read as a loss.
  'bookings.cancelNothingPaid': {
    en: 'You haven’t paid anything on this booking, so there is nothing to refund.',
    ur: 'آپ نے اس بکنگ پر کچھ ادا نہیں کیا، اس لیے واپسی کے لیے کچھ نہیں ہے۔',
  },
  // Shown when the refund engine is off for this vendor (404) — we genuinely do
  // not know the figure, and saying so is not the same as saying zero.
  'bookings.cancelPolicyUnknown': {
    en: 'Any payment you have made is subject to the vendor’s refund policy. Your vendor will confirm the amount.',
    ur: 'آپ کی ادا کردہ رقم وینڈر کی واپسی پالیسی کے تابع ہے۔ رقم کی تصدیق وینڈر کرے گا۔',
  },
  'bookings.cancelReason': { en: 'Reason (optional)', ur: 'وجہ (اختیاری)' },
  'bookings.cancelReasonHint': {
    en: 'The vendor sees this. A line is enough.',
    ur: 'وینڈر یہ دیکھے گا۔ ایک سطر کافی ہے۔',
  },
  'bookings.cancelConfirm': { en: 'Yes, cancel', ur: 'ہاں، منسوخ کریں' },
  'bookings.cancelKeep': { en: 'Keep booking', ur: 'بکنگ رہنے دیں' },
  'bookings.cancelDone': { en: 'Booking cancelled', ur: 'بکنگ منسوخ ہو گئی' },
  'bookings.cancelFailed': { en: 'Couldn’t cancel the booking. Try again.', ur: 'بکنگ منسوخ نہیں ہو سکی۔ دوبارہ کوشش کریں۔' },

  // Guides
  'guides.title': { en: 'Wedding guides', ur: 'شادی گائیڈز' },
  'guides.subtitle': { en: 'Everything you need to plan your shaadi — from costs to rasms.', ur: 'اپنی شادی کی منصوبہ بندی کے لیے سب کچھ — اخراجات سے رسموں تک۔' },

  /**
   * Sentence case, not ALL CAPS.
   *
   * These were written for v3, where a section title was an 11px uppercase
   * overline tracked to 1.76 — caps are right at that size and that role. v4
   * renders them through `Section` at `h2` (22px), and a 22px word in capitals
   * does not read as a heading, it reads as shouting. The case belonged to the
   * old component, so it left with it.
   */
  // Vendor detail
  'detail.about': { en: 'About', ur: 'تعارف' },
  'detail.packages': { en: 'Packages', ur: 'پیکجز' },
  'detail.services': { en: 'Services and amenities', ur: 'خدمات اور سہولیات' },
  'detail.gallery': { en: 'Gallery', ur: 'گیلری' },
  'detail.reviews': { en: 'Reviews', ur: 'ریویوز' },
  'detail.availability': { en: 'Availability', ur: 'دستیابی' },
  'detail.moreFromVendor': { en: 'More from this vendor', ur: 'اسی وینڈر سے مزید' },
  'detail.requestBooking': { en: 'Request booking', ur: 'بکنگ کی درخواست' },
  'detail.whatsapp': { en: 'WhatsApp', ur: 'واٹس ایپ' },
  'detail.call': { en: 'Call', ur: 'کال' },
  'detail.share': { en: 'Share', ur: 'شیئر' },
  // Screen-reader label for each photograph in the hero carousel. Composed as
  // "<photoOf> 3 / 10" rather than an interpolated sentence, because there is
  // no interpolation in `translate()` and an Urdu sentence cannot be built by
  // concatenating an English word order.
  'detail.photoOf': { en: 'Photo', ur: 'تصویر' },
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
  // ── Inquiry sheet ────────────────────────────────────────────────────────
  // These replace the old `booking.request*` keys. That block called the sheet
  // "Request a booking" and its button "Send booking request" while the code
  // posted to `/leads/inquiry` and created a LEAD — sitting on the same screen
  // as the real booking flow, which posts to `/bookings` and creates a booking.
  // Two different things wearing the same words is how a customer ends up
  // believing they have a booking when they have an enquiry.
  'inquiry.title': { en: 'Ask about your date', ur: 'اپنی تاریخ کے بارے میں پوچھیں' },
  'inquiry.sentTitle': { en: 'Inquiry sent', ur: 'استفسار بھیج دیا گیا' },
  'inquiry.sentBody': { en: 'Your inquiry is on its way. The vendor will get back to you on the details you gave.', ur: 'آپ کا استفسار بھیج دیا گیا ہے۔ وینڈر آپ کی دی گئی تفصیلات پر رابطہ کرے گا۔' },
  // The honest version, for the ~98% of listings that are unclaimed OSM imports
  // whose owner has never logged in. Promising a reply nobody can send is worse
  // than saying so.
  'inquiry.sentUnclaimed': { en: 'This vendor hasn’t claimed their listing yet, so there’s no guarantee they’ll see this. We’ve saved it — it’s worth calling them directly too.', ur: 'اس وینڈر نے ابھی اپنی لسٹنگ کلیم نہیں کی، اس لیے یقین نہیں کہ وہ اسے دیکھیں گے۔ ہم نے اسے محفوظ کر لیا ہے — بہتر ہے انہیں براہِ راست کال بھی کریں۔' },
  'inquiry.function': { en: 'Function', ur: 'تقریب' },
  'inquiry.eventDate': { en: 'Event date', ur: 'تقریب کی تاریخ' },
  'inquiry.eventDateHint': { en: 'Approximate is fine.', ur: 'تقریبی تاریخ بھی چلے گی۔' },
  'inquiry.guests': { en: 'Guests (approx.)', ur: 'مہمان (تقریباً)' },
  'inquiry.package': { en: 'Package (optional)', ur: 'پیکج (اختیاری)' },
  'inquiry.any': { en: 'Any', ur: 'کوئی بھی' },
  'inquiry.yourName': { en: 'Your name', ur: 'آپ کا نام' },
  'inquiry.phone': { en: 'Phone / WhatsApp', ur: 'فون / واٹس ایپ' },
  'inquiry.email': { en: 'Email', ur: 'ای میل' },
  'inquiry.message': { en: 'Anything else? (optional)', ur: 'کچھ اور؟ (اختیاری)' },
  'inquiry.send': { en: 'Send inquiry', ur: 'استفسار بھیجیں' },
  'inquiry.noPayment': { en: 'Nothing is booked or owed. This just reaches the vendor.', ur: 'نہ کوئی بکنگ ہوتی ہے نہ کوئی رقم واجب۔ یہ صرف وینڈر تک پہنچتا ہے۔' },
  // The backend needs a channel it can REPLY on. The old copy asked for "name
  // or phone", which let someone through with only a name — and the server then
  // rejected them for something the form had said was fine.
  'inquiry.errContact': { en: 'Add your phone or email so the vendor can reply.', ur: 'اپنا فون یا ای میل شامل کریں تاکہ وینڈر جواب دے سکے۔' },
  'inquiry.errSend': { en: 'Couldn’t send your inquiry. Please try again.', ur: 'آپ کا استفسار نہیں بھیجا جا سکا۔ دوبارہ کوشش کریں۔' },

  // Auth
  'auth.wordmark': { en: 'WEDDING WALA', ur: 'ویڈنگ والا' },
  'auth.welcomeBack': { en: 'Welcome back.', ur: 'خوش آمدید' },
  /* Was "save vendors, message & book". The app has no chat, so "message" was a
     promise it cannot keep — on the sign-in screen, of all places. Every noun
     here now points at something that exists: favourites, the wedding date, the
     bookings list. rules.md §0, truth outranks beauty. */
  'auth.signInSub': { en: 'Your shortlist, your dates and your bookings — right where you left them.', ur: 'آپ کی پسندیدہ فہرست، تاریخیں اور بکنگز — جہاں آپ نے چھوڑی تھیں۔' },
  'auth.createAccount': { en: 'Create your account', ur: 'اپنا اکاؤنٹ بنائیں' },
  'auth.registerSub': { en: 'One account for venues, catering, photography — and everything after.', ur: 'ایک اکاؤنٹ — ہال، کیٹرنگ، فوٹوگرافی اور اس کے بعد سب کچھ۔' },
  'auth.forgot': { en: 'Forgot password?', ur: 'پاس ورڈ بھول گئے؟' },
  'auth.addPhoto': { en: 'Add a photo', ur: 'تصویر شامل کریں' },
  'auth.photoHint': { en: 'Optional — helps vendors recognise you.', ur: 'اختیاری — وینڈرز آپ کو پہچان سکیں گے۔' },
  'auth.changePhoto': { en: 'Change photo', ur: 'تصویر تبدیل کریں' },
  'auth.removePhoto': { en: 'Remove', ur: 'ہٹا دیں' },
  'auth.pwWeak': { en: 'Weak', ur: 'کمزور' },
  'auth.pwFair': { en: 'Fair', ur: 'ٹھیک' },
  'auth.pwGood': { en: 'Good', ur: 'اچھا' },
  'auth.pwStrong': { en: 'Strong', ur: 'مضبوط' },
  'auth.legalNote': { en: 'By creating an account you agree to our', ur: 'اکاؤنٹ بنانے سے آپ ہماری ان شرائط سے اتفاق کرتے ہیں' },
  'auth.terms': { en: 'Terms of Service', ur: 'سروس کی شرائط' },
  'auth.privacy': { en: 'Privacy Policy', ur: 'پرائیویسی پالیسی' },
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

  // Shared (forms / planning tools)
  'common.high': { en: 'High', ur: 'زیادہ' },
  'common.medium': { en: 'Medium', ur: 'درمیانہ' },
  'common.low': { en: 'Low', ur: 'کم' },
  'common.delete': { en: 'Delete', ur: 'حذف کریں' },
  'common.save': { en: 'Save', ur: 'محفوظ کریں' },
  'common.saveChanges': { en: 'Save changes', ur: 'تبدیلیاں محفوظ کریں' },
  'common.category': { en: 'Category', ur: 'زمرہ' },
  'common.priority': { en: 'Priority', ur: 'ترجیح' },

  // Onboarding
  'onb.skip': { en: 'Skip', ur: 'چھوڑیں' },
  'onb.next': { en: 'Next', ur: 'اگلا' },
  'onb.getStarted': { en: 'Get started', ur: 'شروع کریں' },
  'onb.s1Title': { en: 'Discover the best', ur: 'بہترین دریافت کریں' },
  // Same correction as `home.step1Body`: the count is not ours to hardcode and
  // "trusted" is not ours to claim (B4). Found because onboarding is the first
  // screen a new install sees, so it was on screen during the S1 verification.
  'onb.s1Body': { en: 'Browse wedding vendors across Pakistan — venues, photographers, caterers, makeup and more.', ur: 'پاکستان بھر میں شادی کے وینڈرز دیکھیں — مقامات، فوٹوگرافرز، کیٹررز، میک اپ اور مزید۔' },
  'onb.s2Title': { en: 'Plan every detail', ur: 'ہر تفصیل کی منصوبہ بندی' },
  'onb.s2Body': { en: 'Budget, checklist, guest list and a day-of timeline — your whole shaadi, organised in one place.', ur: 'بجٹ، چیک لسٹ، مہمانوں کی فہرست اور دن کا ٹائم لائن — آپ کی پوری شادی، ایک جگہ منظم۔' },
  'onb.s3Title': { en: 'Connect directly', ur: 'براہِ راست رابطہ' },
  'onb.s3Body': { en: 'Save your favourites, compare them, and reach vendors on WhatsApp — no middleman, no commission.', ur: 'اپنے پسندیدہ محفوظ کریں، موازنہ کریں، اور وینڈرز سے واٹس ایپ پر رابطہ کریں — نہ کوئی بیچ والا، نہ کمیشن۔' },

  // Profile
  'profile.title': { en: 'Profile', ur: 'پروفائل' },
  'profile.yourDetails': { en: 'YOUR DETAILS', ur: 'آپ کی تفصیلات' },
  'profile.changePassword': { en: 'CHANGE PASSWORD', ur: 'پاس ورڈ تبدیل کریں' },
  'profile.city': { en: 'City', ur: 'شہر' },
  'profile.saved': { en: 'Saved ✓', ur: 'محفوظ ✓' },
  'profile.currentPassword': { en: 'Current password', ur: 'موجودہ پاس ورڈ' },
  'profile.newPassword': { en: 'New password', ur: 'نیا پاس ورڈ' },
  'profile.updatePassword': { en: 'Update password', ur: 'پاس ورڈ اپڈیٹ کریں' },
  'profile.pwLen': { en: 'New password must be at least 8 characters.', ur: 'نیا پاس ورڈ کم از کم ۸ حروف کا ہونا چاہیے۔' },
  'profile.errEmail': { en: 'Enter a valid email address.', ur: 'درست ای میل ایڈریس درج کریں۔' },
  'profile.errSave': { en: 'Couldn’t save your changes. Please try again.', ur: 'تبدیلیاں محفوظ نہیں ہو سکیں۔ دوبارہ کوشش کریں۔' },
  'profile.photoHint': { en: 'Tap to change. Saves straight away.', ur: 'تبدیل کرنے کے لیے دبائیں۔ فوراً محفوظ ہو جاتی ہے۔' },
  'profile.pwUpdated': { en: 'Password updated.', ur: 'پاس ورڈ اپڈیٹ ہو گیا۔' },
  'profile.pwError': { en: 'Couldn’t update password. Check your current password.', ur: 'پاس ورڈ اپڈیٹ نہیں ہو سکا۔ اپنا موجودہ پاس ورڈ چیک کریں۔' },

  // Budget tool
  'budget.totalEstimated': { en: 'Total estimated', ur: 'کل تخمینہ' },
  'budget.spent': { en: 'Spent', ur: 'خرچ شدہ' },
  'budget.byCategory': { en: 'By category', ur: 'زمرے کے لحاظ سے' },
  'budget.lineItems': { en: 'Line items', ur: 'اشیاء' },
  'budget.paid': { en: 'Paid', ur: 'ادا شدہ' },
  'budget.editItem': { en: 'Edit item', ur: 'آئٹم میں ترمیم' },
  'budget.addItem': { en: 'Add item', ur: 'آئٹم شامل کریں' },
  'budget.item': { en: 'Item', ur: 'آئٹم' },
  'budget.estimated': { en: 'Estimated (Rs)', ur: 'تخمینہ (روپے)' },
  'budget.paidRs': { en: 'Paid (Rs)', ur: 'ادا شدہ (روپے)' },
  'budget.remaining': { en: 'Remaining', ur: 'باقی' },
  'budget.empty': { en: 'No budget lines yet', ur: 'ابھی کوئی بجٹ آئٹم نہیں' },
  'budget.emptySub': { en: 'Add what you expect to spend, category by category.', ur: 'جو خرچ متوقع ہے، زمرے کے لحاظ سے شامل کریں۔' },
  'budget.addFirst': { en: 'Add your first item', ur: 'پہلا آئٹم شامل کریں' },

  // Checklist tool
  'checklist.done': { en: 'done', ur: 'مکمل' },
  'checklist.addTask': { en: 'Add task', ur: 'ٹاسک شامل کریں' },
  'checklist.task': { en: 'Task', ur: 'ٹاسک' },
  'checklist.editTask': { en: 'Edit task', ur: 'ٹاسک میں ترمیم' },
  'checklist.complete': { en: 'Complete', ur: 'مکمل' },
  'checklist.empty': { en: 'Nothing on the list yet', ur: 'ابھی فہرست خالی ہے' },
  'checklist.emptySub': { en: 'Add what has to happen before the big day.', ur: 'بڑے دن سے پہلے جو کرنا ہے وہ شامل کریں۔' },

  // Guests tool
  'guests.total': { en: 'Total', ur: 'کل' },
  'guests.attending': { en: 'Attending', ur: 'شریک' },
  'guests.pending': { en: 'Pending', ur: 'زیرِ التوا' },
  'guests.declined': { en: 'Declined', ur: 'معذرت' },
  'guests.searchGuests': { en: 'Search guests', ur: 'مہمان تلاش کریں' },
  'guests.allGroups': { en: 'All groups', ur: 'تمام گروپس' },
  'guests.emptyList': { en: 'No guests yet — add your first.', ur: 'ابھی کوئی مہمان نہیں — پہلا شامل کریں۔' },
  'guests.editGuest': { en: 'Edit guest', ur: 'مہمان میں ترمیم' },
  'guests.addGuest': { en: 'Add guest', ur: 'مہمان شامل کریں' },
  'guests.name': { en: 'Name', ur: 'نام' },
  'guests.group': { en: 'Group', ur: 'گروپ' },
  'guests.partySize': { en: 'Party size', ur: 'افراد کی تعداد' },
  'guests.guestWord': { en: 'guests', ur: 'مہمان' },
  'rsvp.attending': { en: 'Attending', ur: 'شریک' },
  'rsvp.pending': { en: 'Pending', ur: 'زیرِ التوا' },
  'rsvp.declined': { en: 'Declined', ur: 'معذرت' },
  'rsvp.label': { en: 'RSVP', ur: 'حاضری' },
  // Spoken by the RSVP control's accessibility label so a screen-reader user
  // knows a tap CHANGES the value rather than just reading it.
  'rsvp.tapToChange': { en: 'RSVP, tap to change', ur: 'حاضری، تبدیل کرنے کے لیے دبائیں' },
  'guests.emptyTitle': { en: 'No guests yet', ur: 'ابھی کوئی مہمان نہیں' },

  // Timeline tool
  'timeline.intro': { en: 'Your day-of schedule, minute by minute.', ur: 'آپ کے دن کا شیڈول، منٹ بہ منٹ۔' },
  'timeline.editEvent': { en: 'Edit event', ur: 'ایونٹ میں ترمیم' },
  'timeline.addEvent': { en: 'Add event', ur: 'ایونٹ شامل کریں' },
  'timeline.time': { en: 'Time (HH:MM)', ur: 'وقت (HH:MM)' },
  'timeline.duration': { en: 'Duration', ur: 'دورانیہ' },
  'timeline.event': { en: 'Event', ur: 'ایونٹ' },
  'timeline.location': { en: 'Location', ur: 'مقام' },
} as const satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, locale: Locale): string {
  const entry = STRINGS[key];
  return entry[locale] ?? entry.en;
}
