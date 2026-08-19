/**
 * Day-of timeline - the planning tool. Redrawn on v4.
 *
 * -- A badge that said one thing and coloured another ----------------------
 *
 * Every event carried `<Badge label={item.category} tone={PRIORITY_TONE[item.priority]} />`.
 * The TEXT was the category ("Barat", "Rukhsati"); the COLOUR was the priority.
 * So a low-priority Barat and a high-priority Barat rendered the same word in
 * two different colours, and nothing on the screen said why. A chip encodes one
 * fact. The category is now a plain caption beside the other metadata, and the
 * badge carries the priority it was already coloured by - text and tone finally
 * agreeing.
 *
 * -- The rail --------------------------------------------------------------
 *
 * A gold 12px dot per event and a 2px connector, with the time set in gold
 * beside it. On a ten-event day that is thirty gold elements down one column.
 * `StatusTimeline` had exactly this and was rebuilt on ink for exactly this
 * reason: when the rail is monochrome, a colour on it means something. Here the
 * rail is ink and hairline, and the time - which is the thing you scan for - is
 * `mono`, so 6:00 PM and 11:00 PM align down the column instead of wandering.
 *
 * -- And the same five the other tools had ---------------------------------
 *
 * A bordered card per event, a hand-rolled header with an ink-on-near-black back
 * chevron, its own modal chrome instead of `Sheet`, a FAB bottom-right, and no
 * `useT` in the list body at all - so nothing in it mirrored for Urdu.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  Button,
  ChipSelect,
  EmptyState,
  FormField,
  ScreenHeader,
  Sheet,
  Text,
} from '@/components/ui';
import { PRIORITY_TONE, planLabel, TIMELINE_CATEGORIES, TIMELINE_SEED, type Priority, type TimelineItem } from '@/features/planning/types';
import { newId, useLocalList } from '@/features/planning/useLocalList';
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { haptics, layout, overlay, useTheme } from '@/theme';

export default function TimelineTool() {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const insets = useSafeAreaInsets();
  const { items, add, update, remove } = useLocalList<TimelineItem>('ww.plan.timeline', TIMELINE_SEED(isUrdu), locale);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TimelineItem | null>(null);

  const sorted = useMemo(() => [...items].sort((a, b) => a.time.localeCompare(b.time)), [items]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <ScreenHeader
        title={tr('tool.timeline')}
        onBack={() => router.back()}
        backLabel={tr('common.back')}
        urdu={isUrdu}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('timeline.addEvent')}
            onPress={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            hitSlop={12}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: t.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: t.layout.hairline,
              borderColor: overlay.hairlineOnDark,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="add" size={22} color={t.colors.onDark} />
          </Pressable>
        }
      />

      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingBottom: insets.bottom + t.spacing.vast,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text
            variant="body"
            tone="muted"
            urdu={isUrdu}
            style={{ paddingVertical: t.spacing.lg, textAlign: isUrdu ? 'right' : 'left' }}
          >
            {tr('timeline.intro')}
          </Text>
        }
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.time} ${item.event}`}
            onPress={() => {
              setEditing(item);
              setModalOpen(true);
            }}
            style={({ pressed }) => ({
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              gap: t.spacing.md,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            {/* Time. `mono` so 6:00 PM and 11:00 PM align down the column -
                the time is what you scan a run-sheet for. Never `urdu`. */}
            <View style={{ width: 54, alignItems: isUrdu ? 'flex-start' : 'flex-end', paddingTop: 2 }}>
              <Text variant="mono" tone="primary" style={{ fontSize: 13 }}>
                {ltr(item.time, isUrdu)}
              </Text>
            </View>

            {/* The rail: an ink dot and a hairline. See the header note. */}
            <View style={{ alignItems: 'center', width: 10 }}>
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: t.colors.textPrimary,
                  marginTop: 6,
                }}
              />
              {index < sorted.length - 1 ? (
                <View
                  style={{
                    width: t.layout.hairline,
                    flex: 1,
                    minHeight: 40,
                    marginTop: 3,
                    backgroundColor: t.colors.borderStrong,
                  }}
                />
              ) : null}
            </View>

            <View style={{ flex: 1, paddingBottom: t.spacing.xl, gap: 3 }}>
              <View
                style={{
                  flexDirection: isUrdu ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: t.spacing.sm,
                }}
              >
                <Text
                  variant="title"
                  urdu={isUrdu}
                  numberOfLines={2}
                  style={{ flexShrink: 1, textAlign: isUrdu ? 'right' : 'left' }}
                >
                  {item.event}
                </Text>
                {/* The badge now carries the PRIORITY it is coloured by. */}
                <Badge
                  label={tr(`common.${item.priority}` as StringKey)}
                  urdu={isUrdu}
                  tone={PRIORITY_TONE[item.priority]}
                />
              </View>

              {/* Category, duration and location - all metadata, all one row. */}
              <View
                style={{
                  flexDirection: isUrdu ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: t.spacing.md,
                }}
              >
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {planLabel(item.category, isUrdu)}
                </Text>
                {item.duration ? (
                  <Meta icon="time-outline" text={item.duration} urdu={isUrdu} />
                ) : null}
                {item.location ? (
                  <Meta icon="location-outline" text={item.location} urdu={isUrdu} />
                ) : null}
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title={tr('timeline.addEvent')}
            message={tr('timeline.intro')}
            actionLabel={tr('timeline.addEvent')}
            onAction={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            urdu={isUrdu}
          />
        }
      />

      <EventModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSave={(data) => {
          if (editing) update(editing.id, data);
          else add({ id: newId(), ...data });
          haptics.success();
          setModalOpen(false);
        }}
        onDelete={editing ? () => { remove(editing.id); setModalOpen(false); } : undefined}
      />
    </View>
  );
}

function EventModal({
  visible,
  onClose,
  editing,
  onSave,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  editing: TimelineItem | null;
  onSave: (data: Omit<TimelineItem, 'id'>) => void;
  onDelete?: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [time, setTime] = useState('');
  const [event, setEvent] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<string>(TIMELINE_CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setTime(editing?.time ?? '');
      setEvent(editing?.event ?? '');
      setDuration(editing?.duration ?? '');
      setLocation(editing?.location ?? '');
      setCategory(editing?.category ?? TIMELINE_CATEGORIES[0]);
      setPriority(editing?.priority ?? 'medium');
    }
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editing ? tr('timeline.editEvent') : tr('timeline.addEvent')}
      primaryLabel={editing ? tr('common.save') : tr('timeline.addEvent')}
      primaryDisabled={!event.trim() || !time.trim()}
      onPrimary={() =>
        onSave({
          time: time.trim(),
          event: event.trim(),
          duration: duration.trim() || undefined,
          location: location.trim() || undefined,
          category,
          priority,
        })
      }
      urdu={isUrdu}
    >
      <View style={{ gap: t.spacing.xl }}>
        <View style={{ flexDirection: isUrdu ? 'row-reverse' : 'row', gap: t.spacing.lg }}>
          <View style={{ flex: 1 }}>
            <FormField
              label={tr('timeline.time')}
              urdu={isUrdu}
              placeholder="18:00"
              value={time}
              onChangeText={setTime}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label={tr('timeline.duration')}
              urdu={isUrdu}
              placeholder="1 hr"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        <FormField
          label={tr('timeline.event')}
          urdu={isUrdu}
          placeholder={tr('ph.timelineEvent')}
          value={event}
          onChangeText={setEvent}
        />
        <FormField
          label={tr('timeline.location')}
          urdu={isUrdu}
          placeholder={tr('ph.timelineLocation')}
          value={location}
          onChangeText={setLocation}
        />

        <Field label={tr('common.category')} urdu={isUrdu}>
          <ChipSelect
            options={TIMELINE_CATEGORIES.map((c) => ({ value: c, label: planLabel(c, isUrdu) }))}
            value={category}
            onChange={(v) => setCategory(v ?? TIMELINE_CATEGORIES[0])}
            urdu={isUrdu}
          />
        </Field>

        <Field label={tr('common.priority')} urdu={isUrdu}>
          <ChipSelect
            scroll={false}
            options={[
              { value: 'high', label: tr('common.high') },
              { value: 'medium', label: tr('common.medium') },
              { value: 'low', label: tr('common.low') },
            ]}
            value={priority}
            onChange={(v) => setPriority((v as Priority) ?? 'medium')}
            urdu={isUrdu}
          />
        </Field>

        {onDelete ? (
          <Button label={tr('common.delete')} urdu={isUrdu} variant="ghost" onPress={onDelete} />
        ) : null}
      </View>
    </Sheet>
  );
}

function Meta({
  icon,
  text,
  urdu,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  urdu?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Ionicons name={icon} size={13} color={t.colors.textMuted} />
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function Field({
  label,
  urdu,
  children,
}: {
  label: string;
  urdu?: boolean;
  children: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <Text
        variant="overline"
        tone="muted"
        urdu={urdu}
        style={{
          textAlign: urdu ? 'right' : 'left',
          ...(urdu ? null : { textTransform: 'uppercase' as const }),
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
