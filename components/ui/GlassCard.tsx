import React, { ReactNode } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: any;
  gradient?: string[];
  span?: 1 | 2 | 3;
  compact?: boolean;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({ children, onPress, style, gradient, span = 1, compact = false, testID }: GlassCardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const cardContent = (
    <View style={[
      styles.inner,
      compact && styles.innerCompact,
      {
        backgroundColor: colors.cardGlass,
        borderColor: colors.cardGlassBorder,
      },
    ]}>
      {gradient ? (
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, spanStyles[span], animatedStyle, style]}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View testID={testID} style={[styles.container, spanStyles[span], animatedStyle, style]}>
      {cardContent}
    </Animated.View>
  );
}

const spanStyles = StyleSheet.create({
  1: { flex: 1 },
  2: { flex: 2 },
  3: { flex: 3 },
});

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
  },
  inner: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
    }),
  },
  innerCompact: {
    borderRadius: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
