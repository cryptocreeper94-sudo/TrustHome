import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface PillButtonProps {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PillButton({
  title,
  icon,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  testID,
}: PillButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const variantStyles = {
    primary: {
      bg: colors.primary,
      text: colors.textInverse,
      border: 'transparent',
    },
    secondary: {
      bg: colors.backgroundTertiary,
      text: colors.text,
      border: colors.border,
    },
    ghost: {
      bg: 'transparent',
      text: colors.primary,
      border: 'transparent',
    },
    accent: {
      bg: colors.accent,
      text: colors.textInverse,
      border: 'transparent',
    },
  };

  const sizeStyles = {
    small: { paddingH: 14, paddingV: 6, fontSize: 13, iconSize: 16 },
    medium: { paddingH: 20, paddingV: 10, fontSize: 15, iconSize: 18 },
    large: { paddingH: 28, paddingV: 14, fontSize: 17, iconSize: 22 },
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        animatedStyle,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={s.iconSize} color={v.text} style={title ? styles.iconWithText : undefined} /> : null}
          {title ? <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>{title}</Text> : null}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  text: {
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  iconWithText: {
    marginRight: 6,
  },
});
