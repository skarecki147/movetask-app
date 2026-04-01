import type { HeaderTitleProps } from '@react-navigation/elements';
import { useEffect } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { neonHeaderTitleStyle } from '@/shared/theme/neon';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';

const SHINE_MS = 2600;

function staticTitleStyle(s: HeaderTitleProps['style']): StyleProp<TextStyle> | undefined {
  return s as StyleProp<TextStyle>;
}

export function NeonHeaderTitle({ children, allowFontScaling, onLayout, style }: HeaderTitleProps) {
  const { resolved } = useMovetaskTheme();
  const base = neonHeaderTitleStyle(resolved);
  const navStyle = staticTitleStyle(style);
  const shineOpacity = useSharedValue(0.08);

  useEffect(() => {
    shineOpacity.value = withRepeat(
      withTiming(0.22, { duration: SHINE_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [shineOpacity]);

  const shineWrapStyle = useAnimatedStyle(() => ({
    opacity: shineOpacity.value,
  }));

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Text style={[navStyle, base]} allowFontScaling={allowFontScaling} numberOfLines={1}>
        {children}
      </Text>
      <Animated.View
        pointerEvents="none"
        style={[styles.shineWrap, shineWrapStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text
          style={[navStyle, base, styles.shine]}
          allowFontScaling={allowFontScaling}
          numberOfLines={1}
        >
          {children}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  shineWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shine: {
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});
