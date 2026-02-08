import React, { ReactNode, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface HorizontalCarouselProps {
  title?: string;
  children: ReactNode;
  onSeeAll?: () => void;
  style?: any;
  itemWidth?: number;
}

export function HorizontalCarousel({ title, children, onSeeAll, style, itemWidth = 220 }: HorizontalCarouselProps) {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);

  const handleScroll = useCallback((e: any) => {
    scrollX.current = e.nativeEvent.contentOffset.x;
  }, []);

  const scrollLeft = useCallback(() => {
    const newX = Math.max(0, scrollX.current - itemWidth);
    scrollRef.current?.scrollTo({ x: newX, animated: true });
  }, [itemWidth]);

  const scrollRight = useCallback(() => {
    const newX = scrollX.current + itemWidth;
    scrollRef.current?.scrollTo({ x: newX, animated: true });
  }, [itemWidth]);

  return (
    <View style={[styles.container, style]}>
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={styles.headerRight}>
            {onSeeAll ? (
              <Pressable onPress={onSeeAll} style={styles.seeAllBtn}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      <View style={styles.arrowRow}>
        <Pressable
          onPress={scrollLeft}
          style={[styles.arrowBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
        >
          <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={scrollRight}
          style={[styles.arrowBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
