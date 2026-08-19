/**
 * Guest list - the planning tool. Redrawn on v4.
 *
 * -- The RSVP badge was a control disguised as a label ---------------------
 *
 * Each row's RSVP rendered as a `Badge` wrapped in a bare `Pressable` that
 * CYCLED pending -> attending -> declined on tap. A badge is this app's
 * vocabulary for a read-only status; nothing about it said "press me", it
 * carried no `accessibilityRole`, and a mis-tap silently moved a guest from
 * Attending to Declined with no undo - on the list that decides the catering
 * headcount.
 *
 * It stays a cycle, because cycling three states is genuinely the fastest way
 * to work a guest list. But it now looks and announces like a control: a
 * hairline ring, a cycle glyph, `accessibilityRole="button"`, and a label that
 * says a tap changes the value.
 *
 * `pending` also stops being gold. Gold means "action" in this system, and a
 * guest who has not replied yet is not an action - it is the default state of
 * every row on the screen.
 *
 * -- And the same five the other tools had --------------------------------
 *
 * A `Card` per row plus a summary card, a hand-rolled header with an
 * ink-on-near-black back chevron, its own modal chrome instead of `Sheet`, a
 * FAB bottom-right, and five i18n keys stored pre-SHOUTED then passed to
 * `variant="overline"`, which uppercases Latin itself.
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
  Input,
  ScreenHeader,
  Sheet,
  Text,
} from '@/components/ui';
import { GUEST_GROUPS, GUEST_SEED, planLabel, type GuestItem, type Rsvp } from '@/features/planning/types';
import { newId, useLocalList } from '@/features/planning/useLocalList';
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { haptics, layout, overlay, useTheme } from '@/theme';

/** `neutral` for pending - gold means "action", and "has not replied yet" is
 *  the default state of the list, not something to press. */
const RSVP_TONE: Record<Rsvp, 'success' | 'neutral' | 'danger'> = {
  attending: 'success',
  pending: 'neutral',
  declined: 'danger',
};
const RSVP_CYCLE: Record<Rsvp, Rsvp> = { pending: 'attending', attending: 'declined', declined: 'pending' };

export default function GuestsTool() {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const insets = useSafeAreaInsets();
  const { items, add, update, remove } = useLocalList<GuestItem>('ww.plan.guests', GUEST_SEED(isUrdu), locale);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GuestItem | null>(null);

  const stats = useMemo(() => {
    const heads = (rsvp?: Rsvp) => items.filter((g) => !rsvp || g.rsvp === rsvp).reduce((s, g) => s + (g.count || 1), 0);
    return { total: heads(), attending: heads('attending'), pending: heads('pending'), declined: heads('declined') };
  }, [items]);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter((g) => (!group || g.group === group) && (!s || g.name.toLowerCase().includes(s)));
  }, [items, search, group]);

  const groupOptions = useMemo(() => {
    const present = [...new Set(items.map((g) => g.group))];
    return GUEST_GROUPS.filter((g) => present.includes(g)).map((g) => ({ value: g, label: planLabel(g, isUrdu) }));
    // `isUrdu` belongs here: the VALUE is the stored English group, but the
    // LABEL is language-dependent, so the filter chips must rebuild on a
    // language change or they keep showing the previous language's words.
  }, [items, isUrdu]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <ScreenHeader
        title={tr('tool.guests')}
        onBack={() => router.back()}
        backLabel={tr('common.back')}
        urdu={isUrdu}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('guests.addGuest')}
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
        data={shown}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingBottom: insets.bottom + t.spacing.vast,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: t.spacing.xl, paddingBottom: t.spacing.xl }}>
            {/* Four figures on paper, under a hairline. No box. */}
            <View
              style={{
                flexDirection: isUrdu ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                paddingBottom: t.spacing.lg,
                borderBottomWidth: t.layout.hairline,
                borderBottomColor: t.colors.border,
              }}
            >
              <Stat label={tr('guests.total')} value={stats.total} tone="primary" urdu={isUrdu} />
              <Stat label={tr('guests.attending')} value={stats.attending} tone="success" urdu={isUrdu} />
              <Stat label={tr('guests.pending')} value={stats.pending} tone="muted" urdu={isUrdu} />
              {/* Danger only when there is something to be alarmed about. Zero
                  declined is the BEST possible state and it was painted in the
                  same red as a failed payment. */}
              <Stat
                label={tr('guests.declined')}
                value={stats.declined}
                tone={stats.declined > 0 ? 'danger' : 'muted'}
                urdu={isUrdu}
              />
            </View>
            <Input icon="search-outline" placeholder={tr('guests.searchGuests')} value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
            {groupOptions.length > 1 ? (
              <ChipSelect options={groupOptions} value={group} onChange={setGroup} allLabel={tr('guests.allGroups')} urdu={isUrdu} />
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: t.spacing.md,
              borderBottomWidth: index === shown.length - 1 ? 0 : t.layout.hairline,
              borderBottomColor: t.colors.border,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.name}
              onPress={() => {
                setEditing(item);
                setModalOpen(true);
              }}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: t.spacing.lg,
                gap: 3,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                variant="title"
                urdu={isUrdu}
                numberOfLines={1}
                style={{ textAlign: isUrdu ? 'right' : 'left' }}
              >
                {item.name}
              </Text>
              <Text
                variant="caption"
                tone="muted"
                urdu={isUrdu}
                numberOfLines={1}
                style={{ textAlign: isUrdu ? 'right' : 'left' }}
              >
                {`${planLabel(item.group, isUrdu)} · ${ltr(String(item.count), isUrdu)} ${tr('guests.guestWord')}`}
              </Text>
            </Pressable>

            {/* A CONTROL, not a label. See the header note. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${tr('rsvp.tapToChange')}: ${tr(`rsvp.${item.rsvp}` as StringKey)}`}
              onPress={() => {
                haptics.selection();
                update(item.id, { rsvp: RSVP_CYCLE[item.rsvp] });
              }}
              hitSlop={10}
              style={({ pressed }) => ({
                flexDirection: isUrdu ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 5,
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderRadius: t.radius.pill,
                borderWidth: t.layout.hairline,
                borderColor: t.colors.border,
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Badge label={tr(`rsvp.${item.rsvp}` as StringKey)} urdu={isUrdu} tone={RSVP_TONE[item.rsvp]} />
              <Ionicons name="swap-horizontal" size={13} color={t.colors.textFaint} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={tr('guests.emptyTitle')}
            message={tr('guests.emptyList')}
            actionLabel={tr('guests.addGuest')}
            onAction={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            urdu={isUrdu}
          />
        }
      />

      <GuestModal
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

function Stat({
  label,
  value,
  tone,
  urdu,
}: {
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'muted' | 'danger';
  urdu?: boolean;
}) {
  return (
    <View style={{ gap: 2, alignItems: 'center' }}>
      {/* `mono`, never `urdu` - four counts that have to align as a row. */}
      <Text variant="mono" tone={tone} style={{ fontSize: 20 }}>
        {value}
      </Text>
      <Text variant="overline" tone="muted" urdu={urdu}>
        {label}
      </Text>
    </View>
  );
}

function GuestModal({
  visible,
  onClose,
  editing,
  onSave,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  editing: GuestItem | null;
  onSave: (data: Omit<GuestItem, 'id'>) => void;
  onDelete?: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [name, setName] = useState('');
  const [group, setGroup] = useState<string>(GUEST_GROUPS[0]);
  const [count, setCount] = useState('1');
  const [rsvp, setRsvp] = useState<Rsvp>('pending');
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName(editing?.name ?? '');
      setGroup(editing?.group ?? GUEST_GROUPS[0]);
      setCount(editing ? String(editing.count) : '1');
      setRsvp(editing?.rsvp ?? 'pending');
    }
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editing ? tr('guests.editGuest') : tr('guests.addGuest')}
      primaryLabel={editing ? tr('common.save') : tr('guests.addGuest')}
      primaryDisabled={!name.trim()}
      onPrimary={() =>
        onSave({ name: name.trim(), group, count: Number(count) || 1, rsvp })
      }
      urdu={isUrdu}
    >
      <View style={{ gap: t.spacing.xl }}>
        <FormField
          label={tr('guests.name')}
          urdu={isUrdu}
          placeholder={tr('ph.guestName')}
          value={name}
          onChangeText={setName}
        />

        <Field label={tr('guests.group')} urdu={isUrdu}>
          <ChipSelect
            options={GUEST_GROUPS.map((g) => ({ value: g, label: planLabel(g, isUrdu) }))}
            value={group}
            onChange={(v) => setGroup(v ?? GUEST_GROUPS[0])}
            urdu={isUrdu}
          />
        </Field>

        <FormField
          label={tr('guests.partySize')}
          urdu={isUrdu}
          placeholder="1"
          keyboardType="number-pad"
          value={count}
          onChangeText={setCount}
        />

        <Field label={tr('rsvp.label')} urdu={isUrdu}>
          <ChipSelect
            scroll={false}
            options={[
              { value: 'pending', label: tr('rsvp.pending') },
              { value: 'attending', label: tr('rsvp.attending') },
              { value: 'declined', label: tr('rsvp.declined') },
            ]}
            value={rsvp}
            onChange={(v) => setRsvp((v as Rsvp) ?? 'pending')}
            urdu={isUrdu}
          />
        </Field>

        {/* Delete at the bottom of the BODY, never beside the save action in
            the footer - that is how a guest gets removed by a mis-tap. */}
        {onDelete ? (
          <Button label={tr('common.delete')} urdu={isUrdu} variant="ghost" onPress={onDelete} />
        ) : null}
      </View>
    </Sheet>
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
