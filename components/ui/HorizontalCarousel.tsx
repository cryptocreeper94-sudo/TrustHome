import React, { ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface HorizontalCarouselProps {
  title?: string;
  children: ReactNode;
  onSeeAll?: () => void;
  style?: any;
}

export function HorizontalCarousel({ title, children, onSeeAll, style }: HorizontalCarouselProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {onSeeAll ? (
            <Pressable onPress={onSeeAll} style={styles.seeAllBtn}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
});
