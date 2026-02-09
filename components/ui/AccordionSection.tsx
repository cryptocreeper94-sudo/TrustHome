import React, { useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface AccordionSectionProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
  badgeColor?: string;
  style?: any;
}

export function AccordionSection({
  title,
  icon,
  iconColor,
  children,
  defaultOpen = false,
  badge,
  badgeColor,
  style,
}: AccordionSectionProps) {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View style={[styles.container, {
      backgroundColor: colors.cardGlass,
      borderColor: colors.cardGlassBorder,
    }, style]}>
      <Pressable
        style={styles.header}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconWrap, {
              backgroundColor: isDark
                ? (iconColor || colors.primary) + '18'
                : (iconColor || colors.primary) + '0C',
            }]}>
              <Ionicons name={icon} size={16} color={iconColor || colors.primary} />
            </View>
          )}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {badge !== undefined && (
            <View style={[styles.badge, { backgroundColor: (badgeColor || colors.primary) + '18' }]}>
              <Text style={[styles.badgeText, { color: badgeColor || colors.primary }]}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textTertiary}
        />
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.content, { borderTopColor: isDark ? '#222' : '#eee' }]}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
  },
});
