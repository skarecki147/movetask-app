import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { gradientStops, headerGradient, headerGradientShiftTarget } from '@/shared/theme/gradients';
import { headerNeonStyle } from '@/shared/theme/neon';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';

const DURATION_MS = 14000;

export function ThemedHeaderBackground() {
  const { resolved, colors } = useMovetaskTheme();
  const neo = headerNeonStyle(resolved);
  const base = headerGradient(resolved, colors);
  const shift = headerGradientShiftTarget(resolved, colors);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: DURATION_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [progress]);

  const overlayStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const breathe = 0.06 + 0.16 * Math.sin(Math.PI * t);
    const dx = 6 * Math.sin(Math.PI * 2 * t);
    return {
      opacity: breathe,
      transform: [{ translateX: dx }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={gradientStops(base as readonly [string, string, string])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]} pointerEvents="none">
        <LinearGradient
          colors={gradientStops(shift)}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View
        style={[
          styles.neonLine,
          {
            height: typeof neo.borderBottomWidth === 'number' ? neo.borderBottomWidth : 1,
            backgroundColor: neo.borderBottomColor,
            shadowColor: neo.shadowColor,
            shadowOffset: neo.shadowOffset,
            shadowOpacity: neo.shadowOpacity ?? 0,
            shadowRadius: neo.shadowRadius ?? 0,
            elevation: neo.elevation ?? 0,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  neonLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
