import type { TextInputProps } from 'react-native';
import { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, TextInput, StyleSheet, View } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

import { AppText } from './AppText';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  passwordVisibilityToggle?: boolean;
};

export function AppInput({
  label,
  error,
  passwordVisibilityToggle,
  style,
  secureTextEntry,
  value,
  defaultValue,
  onChangeText,
  ...rest
}: Props) {
  const { colors } = useMovetaskTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isControlled = value !== undefined;
  const [uncontrolledHasChars, setUncontrolledHasChars] = useState(
    () => String(defaultValue ?? '').length > 0,
  );

  const showVisibilityToggle = isControlled
    ? String(value ?? '').length > 0
    : uncontrolledHasChars;

  useEffect(() => {
    if (isControlled && String(value ?? '').length === 0) {
      setPasswordVisible(false);
    }
  }, [value, isControlled]);

  const borderColor = error ? colors.danger : colors.border;
  const bg = colors.surface;

  const errorCaption = error ? (
    <AppText variant="caption" style={{ color: colors.danger, marginTop: tokens.spacing.xs }}>
      {error}
    </AppText>
  ) : null;

  if (passwordVisibilityToggle) {
    const handleChangeText = (text: string) => {
      if (!isControlled) {
        setUncontrolledHasChars(text.length > 0);
        if (text.length === 0) setPasswordVisible(false);
      }
      onChangeText?.(text);
    };

    return (
      <View style={styles.wrap}>
        {label ? (
          <AppText variant="label" style={styles.label}>
            {label}
          </AppText>
        ) : null}
        <View
          style={[
            styles.inputRowShell,
            {
              borderColor,
              backgroundColor: bg,
              paddingRight: showVisibilityToggle ? tokens.spacing.xs : tokens.spacing.md,
            },
          ]}>
          <TextInput
            placeholderTextColor={colors.textMuted}
            style={[
              styles.inputRowField,
              { color: colors.text },
              !showVisibilityToggle && { paddingRight: tokens.spacing.sm },
              style,
            ]}
            secureTextEntry={!passwordVisible}
            underlineColorAndroid="transparent"
            value={value}
            defaultValue={defaultValue}
            onChangeText={handleChangeText}
            {...rest}
          />
          {showVisibilityToggle ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
              hitSlop={8}
              onPress={() => setPasswordVisible((v) => !v)}
              style={styles.visibilityBtn}>
              <FontAwesome
                name={passwordVisible ? 'eye-slash' : 'eye'}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>
        {errorCaption}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor,
            backgroundColor: bg,
          },
          style,
        ]}
        secureTextEntry={secureTextEntry}
        {...rest}
      />
      {errorCaption}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: tokens.spacing.md },
  label: { marginBottom: tokens.spacing.xs },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    fontSize: tokens.typography.body,
  },
  inputRowShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: tokens.radius.md,
    paddingLeft: tokens.spacing.md,
    paddingRight: tokens.spacing.xs,
  },
  inputRowField: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    paddingRight: tokens.spacing.xs,
    fontSize: tokens.typography.body,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  visibilityBtn: {
    padding: tokens.spacing.sm,
  },
});
