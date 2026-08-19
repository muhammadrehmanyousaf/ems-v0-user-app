/**
 * Pakistani field normalisation — **ported from the web, not invented here.**
 *
 * Source of truth: `ems-v0/lib/validation/pk-fields.ts`. If that file changes,
 * this one changes with it. The app and the web write to the SAME `User` and
 * `Lead` rows on the same production database, so two normalisers that disagree
 * produce two customers for one person, and nothing downstream can tell.
 *
 * This is exactly what went wrong before this file existed: the app posted
 * whatever the customer typed, so the same person arrived as `0300 1234567`
 * from the app and `03001234567` from the web, and dedupe, OTP delivery and
 * "we already have an account for this number" all quietly missed.
 */

/**
 * One canonical stored shape for a Pakistani mobile: `03XXXXXXXXX`.
 *
 * People type `0300 1234567`, `+92 300 1234567`, `92-300-1234567` and
 * `03001234567`, and every one of those is correct.
 *
 * Anything that isn't a recognisable PK mobile comes back trimmed and otherwise
 * untouched: this **normalises, it never invents**. A landline, an
 * international number or a typo passes through unchanged rather than being
 * mangled into something that looks valid and is not.
 */
export function normalizePkPhone(value: string | null | undefined): string {
  const d = (value ?? '').trim().replace(/[\s\-()./]/g, '');
  const m = /^(?:\+92|92|0)(3\d{9})$/.exec(d);
  return m ? `0${m[1]}` : (value ?? '').trim();
}

/** Store one shape for email too — addresses are case-insensitive in practice. */
export function normalizeEmail(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}
