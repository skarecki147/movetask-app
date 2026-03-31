import { StyleSheet, View } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import type { ThemePreference } from '@/shared/types/ui';
import { tokens } from '@/shared/theme/tokens';
import { AppChip } from '@/shared/ui/AppChip';
import { AppText } from '@/shared/ui/AppText';
import { Screen } from '@/shared/ui/Screen';

const options: { key: ThemePreference; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

export default function SettingsScreen() {
  const { preference, setPreference } = useMovetaskTheme();

  return (
    <Screen scroll>
      <AppText variant="heading" style={styles.title}>
        Settings
      </AppText>
      <AppText variant="label" style={styles.section}>
        Appearance
      </AppText>
      <View style={styles.row}>
        {options.map((o) => (
          <AppChip
            key={o.key}
            label={o.label}
            selected={preference === o.key}
            onPress={() => setPreference(o.key)}
          />
        ))}
      </View>
      <AppText variant="caption" muted style={styles.hint}>
        Theme is saved on this device.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: tokens.spacing.sm, marginBottom: tokens.spacing.lg },
  section: { marginBottom: tokens.spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  hint: { marginTop: tokens.spacing.lg },
});
