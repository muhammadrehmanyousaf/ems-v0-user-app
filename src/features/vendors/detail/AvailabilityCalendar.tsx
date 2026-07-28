/** AvailabilityCalendar — read-only month grid. Busy dates (from the backend)
 * are muted; open future dates get a gold dot. Empty month = fully open. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Row, Section, Text } from '@/components/ui';
import { useVendorAvailability } from '@/features/vendors/vendors.queries';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function monthKey(y: number, m: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}
function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function AvailabilityCalendar({ vendorId }: { vendorId: number | string }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const q = useVendorAvailability(vendorId, monthKey(cursor.y, cursor.m));
  const busy = q.data ?? {};

  const first = new Date(cursor.y, cursor.m, 1).getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const isCurrentMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth();

  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const prev = () => {
    if (isCurrentMonth) return;
    setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }));
  };
  const next = () => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }));

  return (
    <Section title={tr('detail.availability')} urdu={isUrdu}>
      <View style={{ backgroundColor: t.colors.cream, borderColor: t.colors.border, borderWidth: 1, borderRadius: t.radius.md, padding: t.spacing.md, gap: t.spacing.sm }}>
        <Row justify="space-between">
          <Pressable onPress={prev} hitSlop={8} disabled={isCurrentMonth} style={{ opacity: isCurrentMonth ? 0.3 : 1 }}>
            <Ionicons name="chevron-back" size={20} color={t.colors.goldDark} />
          </Pressable>
          <Text variant="title">
            {MONTHS[cursor.m]} {cursor.y}
          </Text>
          <Pressable onPress={next} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color={t.colors.goldDark} />
          </Pressable>
        </Row>

        <Row justify="space-between">
          {WEEKDAYS.map((w) => (
            <View key={w} style={{ width: `${100 / 7}%`, alignItems: 'center' }}>
              <Text variant="overline" tone="muted">{w}</Text>
            </View>
          ))}
        </Row>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((d, i) => {
            if (d === null) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 40 }} />;
            const isPast = isCurrentMonth && d < today.getDate();
            const isBusy = Object.prototype.hasOwnProperty.call(busy, dateKey(cursor.y, cursor.m, d));
            const open = !isPast && !isBusy;
            return (
              <View key={d} style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="caption" tone={isPast ? 'muted' : isBusy ? 'muted' : 'primary'} style={isBusy ? { textDecorationLine: 'line-through' } : undefined}>
                  {d}
                </Text>
                {open ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: t.colors.gold, marginTop: 2 }} /> : <View style={{ height: 6 }} />}
              </View>
            );
          })}
        </View>

        <Row gap="lg" justify="center">
          <Row gap="xxs">
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.colors.gold }} />
            <Text variant="caption" tone="muted" urdu={isUrdu}>{tr('detail.open')}</Text>
          </Row>
          <Row gap="xxs">
            <Text variant="caption" tone="muted" style={{ textDecorationLine: 'line-through' }}>15</Text>
            <Text variant="caption" tone="muted" urdu={isUrdu}>{tr('detail.busy')}</Text>
          </Row>
        </Row>
        <Text variant="caption" tone="muted" align="center" urdu={isUrdu}>
          {tr('detail.confirmDate')}
        </Text>
      </View>
    </Section>
  );
}
