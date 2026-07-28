/** Localized Text — resolves a string key and renders it with Nastaliq/RTL when
 * the app is in Urdu. Only translated strings get the Urdu treatment. */
import { Text, type TextProps } from '@/components/ui';

import type { StringKey } from './strings';
import { useT } from './useT';

export function T({ k, ...props }: { k: StringKey } & Omit<TextProps, 'children' | 'urdu'>) {
  const { t, isUrdu } = useT();
  return (
    <Text {...props} urdu={isUrdu}>
      {t(k)}
    </Text>
  );
}
