/** Input — cream field, beige border, gold focus ring. Ports web `.bridal-input`. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onClear?: () => void;
  error?: string;
}

export function Input({ label, icon, onClear, error, style, value, onFocus, onBlur, ...rest }: InputProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {label ? (
        <Text variant="label" tone="label" style={{ marginBottom: t.spacing.xs }}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: t.colors.card,
            borderColor: error ? t.colors.danger : focused ? t.colors.primary : t.colors.border,
            borderRadius: t.radius.sm,
            paddingHorizontal: t.spacing.md,
          },
          focused && !error ? { shadowColor: t.colors.primary, shadowOpacity: 0.18, shadowRadius: 4, elevation: 1 } : null,
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={t.colors.textLabel} style={{ marginRight: t.spacing.sm }} /> : null}
        <TextInput
          {...rest}
          value={value}
          placeholderTextColor={t.colors.textLabel}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            { color: t.colors.textPrimary, fontFamily: t.fontFamily.body, fontSize: 15 },
            style,
          ]}
        />
        {onClear && value ? (
          <Pressable onPress={onClear} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={t.colors.textLabel} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: t.spacing.xs }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', height: 48, borderWidth: 1 },
  input: { flex: 1, height: '100%', paddingVertical: 0 },
});
