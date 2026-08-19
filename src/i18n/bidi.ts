/**
 * Bidi isolation for Latin/numeric runs inside Urdu text.
 *
 * ── The bug this exists for ───────────────────────────────────────────────
 *
 * The Explore filter chips read "3.0+", "4.5+", "100+", "1000+". Switch the
 * interface to Urdu and they render
 *
 *     +3.0   +4.0   +4.5   +100   +1000
 *
 * The strings did not change. The Unicode bidirectional algorithm did its job:
 * in a right-to-left paragraph, `+` is a neutral character, so a `+` sitting at
 * the end of a number run gets resolved to the paragraph direction and lands on
 * the LEFT of the digits. "1000+" — a floor — becomes "+1000", which reads as a
 * signed quantity. Same class of silent corruption as a `%` after a number, or
 * a "1 / 10" counter, or "Rs 665,000" beside an Urdu label.
 *
 * `textAlign: 'right'` does not fix it and neither does reordering the JSX: the
 * reordering happens inside the text run, below layout.
 *
 * ── The fix ───────────────────────────────────────────────────────────────
 *
 * U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE. The run
 * between them is laid out left-to-right internally and treated as a single
 * neutral object by the surrounding right-to-left text — which is exactly what
 * a price, a threshold or a clock reading is.
 *
 * Isolates (Unicode 6.3) rather than the older U+202D/U+202C embeddings: the
 * embedding characters leak their direction into whatever follows if a string
 * is ever concatenated without its terminator, and these strings are built by
 * template literal all over the app.
 *
 * Only call this for text that will be set in an Urdu paragraph. In English it
 * is a no-op that still costs two invisible code points, so the `urdu` guard is
 * part of the helper rather than left to each call site.
 */
const LRI = '⁦';
const PDI = '⁩';

/**
 * Wrap a Latin/numeric token so Urdu bidi cannot reorder it.
 *
 * ```ts
 * ltr('1000+', isUrdu)   // "1000+" in English, "⁦1000+⁩" in Urdu — both read "1000+"
 * ```
 */
export function ltr(text: string, urdu?: boolean): string {
  if (!urdu || !text) return text;
  return `${LRI}${text}${PDI}`;
}
