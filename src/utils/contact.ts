/** Pakistani phone → WhatsApp / tel links. Numbers are stored inconsistently
 * (e.g. "3274811220", "03274811220", "+923274811220") — normalise to E.164. */
export function normalizePkPhone(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('3')) return `92${digits}`;
  return digits;
}

export function waLink(raw?: string | null, message?: string): string | null {
  const n = normalizePkPhone(raw);
  if (!n) return null;
  const base = `https://wa.me/${n}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink(raw?: string | null): string | null {
  const n = normalizePkPhone(raw);
  return n ? `tel:+${n}` : null;
}
