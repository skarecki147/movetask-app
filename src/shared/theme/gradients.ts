import type { ColorValue } from 'react-native';

import type { ColorPalette } from '@/shared/theme/tokens';

export type ThemeMode = 'light' | 'dark';

export function gradientStops(stops: readonly string[]): [ColorValue, ColorValue, ...ColorValue[]] {
  return stops as unknown as [ColorValue, ColorValue, ...ColorValue[]];
}

export function screenGradient(
  mode: ThemeMode,
  colors: ColorPalette,
): readonly [string, string, string] {
  if (mode === 'dark') {
    return ['#0a0f1a', colors.background, '#121a2e'] as const;
  }
  return ['#ffffff', colors.background, '#e2e8f0'] as const;
}

export function primaryButtonGradient(mode: ThemeMode): readonly string[] {
  if (mode === 'dark') {
    return ['#e9d5ff', '#8b5cf6', '#5b21b6'];
  }
  return ['#ddd6fe', '#7c3aed', '#5b21b6'];
}

export function dangerButtonGradient(mode: ThemeMode): readonly string[] {
  if (mode === 'dark') {
    return ['#fdba74', '#f97316', '#9a3412'];
  }
  return ['#fed7aa', '#ea580c', '#9a3412'];
}

export function tabBarGradient(mode: ThemeMode, colors: ColorPalette): readonly string[] {
  if (mode === 'dark') {
    return ['rgba(30,41,59,0.88)', colors.surface, 'rgba(15,23,42,0.95)'];
  }
  return ['rgba(255,255,255,0.94)', '#ffffff', 'rgba(241,245,249,0.98)'];
}

export function headerGradient(mode: ThemeMode, colors: ColorPalette): readonly string[] {
  if (mode === 'dark') {
    return ['#1e293b', colors.surface, '#172033'];
  }
  return ['#ffffff', '#f8fafc', colors.surface];
}

export function headerGradientShiftTarget(
  mode: ThemeMode,
  _colors: ColorPalette,
): readonly [string, string, string] {
  if (mode === 'dark') {
    return ['#2d2840', '#38304a', '#1c2838'];
  }
  return ['#faf5ff', '#f3e8ff', '#e2e8f0'];
}

export function cardSurfaceGradient(mode: ThemeMode, colors: ColorPalette): readonly string[] {
  if (mode === 'dark') {
    return ['#2d3d52', colors.surface, '#162030'];
  }
  return ['#ffffff', '#f8fafc', '#f1f5f9'];
}

export function columnPanelGradient(mode: ThemeMode, colors: ColorPalette): readonly string[] {
  if (mode === 'dark') {
    return ['rgba(51,65,85,0.35)', colors.surface, 'rgba(15,23,42,0.65)'];
  }
  return ['#f8fafc', colors.surface, '#e2e8f0'];
}

export function chipSelectedGradient(mode: ThemeMode): readonly string[] {
  if (mode === 'dark') {
    return ['#c4b5fd', '#8b5cf6', '#5b21b6'];
  }
  return ['#a78bfa', '#7c3aed', '#5b21b6'];
}

export function secondaryButtonGradient(mode: ThemeMode, colors: ColorPalette): readonly string[] {
  if (mode === 'dark') {
    return ['#334155', colors.surface, '#1e293b'];
  }
  return ['#ffffff', '#f8fafc', '#eef2f7'];
}
