/** Translation hook. `t(key)` → localized string; `isUrdu` → RTL/Nastaliq flag. */
import { useLocaleStore } from '@/store/locale';

import { translate, type Locale, type StringKey } from './strings';

export function useT() {
  const locale = useLocaleStore((s) => s.locale) as Locale;
  const isUrdu = locale === 'ur';
  return {
    locale,
    isUrdu,
    t: (key: StringKey) => translate(key, locale),
  };
}
