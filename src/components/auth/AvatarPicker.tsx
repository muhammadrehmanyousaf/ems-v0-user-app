/**
 * AvatarPicker — the optional profile photograph on signup.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * The web's signup form has had a `profileImage` file input since it shipped
 * (`ems-v0/components/user-registration-form.tsx`, appended as `profileImage`
 * when present). The app's signup did not, so **no account created in the app
 * has ever had an avatar** — and the backend field, the upload middleware and
 * the `mapUser` reader for `profileImage` were all already there and waiting.
 *
 * It is optional on the web and it is optional here. A photograph is a nice
 * account, not a working one; nothing about signup blocks on it.
 *
 * ── Why 'images' and not MediaTypeOptions.Images ──────────────────────────
 *
 * `MediaTypeOptions` is deprecated in SDK 57 in favour of a plain array of
 * media-type strings. Both still work today; the enum will not.
 *
 * ── Permissions ───────────────────────────────────────────────────────────
 *
 * Android 13+ routes `launchImageLibraryAsync` through the system photo picker,
 * which needs no permission at all — so a denied request is NOT a dead end, and
 * we try to open the picker anyway rather than showing an error for a
 * permission the platform did not actually require.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { UploadFile } from '@/lib/api/endpoints/auth';
import { colors, fontFamily, haptics, radius, spacing } from '@/theme';

const SIZE = 84;

export function AvatarPicker({
  value,
  onChange,
  label,
  hint,
  changeLabel,
  removeLabel,
  urdu,
  currentUri,
  busy,
  allowRemove = true,
}: {
  value: UploadFile | null;
  onChange: (file: UploadFile | null) => void;
  label: string;
  hint: string;
  changeLabel: string;
  removeLabel: string;
  urdu?: boolean;
  /** A photograph already stored on the account. Shown when nothing new has
   *  been picked, so editing a profile does not start from an empty circle. */
  currentUri?: string | null;
  busy?: boolean;
  /**
   * Signup can drop a photograph it has not sent yet. Profile cannot: there is
   * no delete endpoint, so a "Remove" there would clear the preview and change
   * nothing on the server — a control that lies.
   */
  allowRemove?: boolean;
}) {
  const shown = value?.uri ?? currentUri ?? null;
  const pick = async () => {
    haptics.selection();
    // Best-effort. On Android 13+ the system picker needs no grant, so a denial
    // here is not a reason to stop.
    await ImagePicker.requestMediaLibraryPermissionsAsync().catch(() => null);

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      // Square, because every surface that shows it is a circle. Cropping at
      // pick time beats cropping at render time, where the head comes off.
      aspect: [1, 1],
      quality: 0.8,
    }).catch(() => null);

    if (!res || res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    onChange({
      uri: a.uri,
      // The backend's multer storage names the file from what it is given; a
      // missing extension there becomes a file nothing will serve.
      name: a.fileName ?? `profile-${Date.now()}.jpg`,
      type: a.mimeType ?? 'image/jpeg',
    });
  };

  return (
    <View style={[styles.root, urdu ? { flexDirection: 'row-reverse' } : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={shown ? changeLabel : label}
        onPress={pick}
        style={({ pressed }) => [styles.well, pressed ? { opacity: 0.85 } : null]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.goldDark} />
        ) : shown ? (
          <Image source={{ uri: shown }} style={styles.image} contentFit="cover" />
        ) : (
          <Ionicons name="camera-outline" size={26} color={colors.textMuted} />
        )}
        <View style={styles.badge}>
          <Ionicons
            name={shown ? 'pencil' : 'add'}
            size={13}
            color={colors.onPrimary}
          />
        </View>
      </Pressable>

      <View style={[styles.copy, urdu ? { alignItems: 'flex-end' } : null]}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={pick}>
          <Text urdu={urdu} style={styles.action}>
            {shown ? changeLabel : label}
          </Text>
        </Pressable>
        {value && allowRemove ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              haptics.selection();
              onChange(null);
            }}
          >
            <Text variant="caption" tone="muted" urdu={urdu}>
              {removeLabel}
            </Text>
          </Pressable>
        ) : (
          <Text variant="caption" tone="muted" urdu={urdu}>
            {hint}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  well: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.sunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  image: { width: SIZE - 2, height: SIZE - 2, borderRadius: radius.pill },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2 },
  action: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    color: colors.goldDark,
  },
});
