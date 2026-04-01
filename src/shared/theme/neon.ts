import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { tokens } from '@/shared/theme/tokens';

export type ThemeMode = 'light' | 'dark';

export function neonShellStyle(mode: ThemeMode): ViewStyle {
  if (mode === 'dark') {
    return {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(196, 181, 253, 0.5)',
      shadowColor: '#a78bfa',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.26,
      shadowRadius: 8,
      elevation: 4,
    };
  }
  return {
    borderWidth: 1,
    borderColor: '#64748b',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 3,
  };
}

export function neonInnerBorderColor(mode: ThemeMode): string {
  if (mode === 'dark') {
    return 'rgba(221, 214, 254, 0.35)';
  }
  return 'rgba(51, 65, 85, 0.55)';
}

export function neonInputBorderColor(mode: ThemeMode): string {
  if (mode === 'dark') {
    return 'rgba(167, 139, 250, 0.4)';
  }
  return '#64748b';
}

export function neonInputGlowStyle(mode: ThemeMode): ViewStyle {
  if (mode === 'dark') {
    return {
      shadowColor: '#c084fc',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
      elevation: 2,
    };
  }
  return {
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 2,
  };
}

export function neonContainerStyle(
  mode: ThemeMode,
  borderRadius: number = tokens.radius.md,
): ViewStyle {
  return {
    ...neonShellStyle(mode),
    borderRadius,
  };
}

export function headerNeonStyle(mode: ThemeMode): ViewStyle {
  if (mode === 'dark') {
    return {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(148, 163, 184, 0.3)',
    };
  }
  return {
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  };
}

export function neonHeaderTitleStyle(mode: ThemeMode): TextStyle {
  if (mode === 'dark') {
    return {
      fontWeight: '600',
      fontSize: 22,
      color: '#f1f5f9',
      textShadowColor: 'rgba(186, 230, 253, 0.38)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 5,
    };
  }
  return {
    fontWeight: '600',
    fontSize: 22,
    color: '#1e293b',
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  };
}

export function neonChromeOutline(mode: ThemeMode): Pick<ViewStyle, 'borderWidth' | 'borderColor'> {
  if (mode === 'light') {
    return { borderWidth: 1, borderColor: '#64748b' };
  }
  return {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.45)',
  };
}
