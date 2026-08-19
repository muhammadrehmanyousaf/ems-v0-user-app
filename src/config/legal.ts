/**
 * Legal constants that MUST match the web.
 *
 * Source of truth: `ems-v0/lib/seo/constants.ts`.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 *
 * The app was posting `termsVersion: '2025-01'` at signup — a hard-coded string
 * that matches no version of the terms that has ever been published. The web
 * sends `2026-05-07`.
 *
 * That is not a cosmetic mismatch. The backend persists this against the user
 * row (migration `20260507110000-user-terms-acceptance`), and it exists for
 * **PayFast underwriting and chargeback defence** — it is the record of which
 * document a customer agreed to. Every account created in the app carried a
 * record saying they accepted a document that does not exist, which is worse
 * than having no record at all: an absent field reads as "we did not capture
 * it", a wrong one reads as evidence until somebody checks.
 */

/** The published terms version. Keep in lockstep with `ems-v0/lib/seo`. */
export const TERMS_VERSION = '2026-05-07' as const;
