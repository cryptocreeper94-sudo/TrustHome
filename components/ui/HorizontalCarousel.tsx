import React, { ReactNode, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { ChevronBackIcon, ChevronForwardIcon } from '@/components/ui/SvgIcons';
import { useTheme } from '@/contexts/ThemeContext';

interface HorizontalCarouselProps {
  title?: string;
  children: ReactNode;
  onSeeAll?: () => void;
  style?: any;
  itemWidth?: number;
  hideArrows?: boolean;
}

export function HorizontalCarousel({ title, children, onSeeAll, style, itemWidth = 220, hideArrows = false }: HorizontalCarouselProps) {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);

  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = useCallback((e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    scrollX.current = x;
    const index = Math.round(x / itemWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [itemWidth, activeIndex]);

  const scrollLeft = useCallback(() => {
    const newX = Math.max(0, scrollX.current - itemWidth);
    scrollRef.current?.scrollTo({ x: newX, animated: true });
  }, [itemWidth]);

  const scrollRight = useCallback(() => {
    const newX = scrollX.current + itemWidth;
    scrollRef.current?.scrollTo({ x: newX, animated: true });
  }, [itemWidth]);

  const scrollToDot = useCallback((index: number) => {
    scrollRef.current?.scrollTo({ x: index * itemWidth, animated: true });
  }, [itemWidth]);

  // Try to determine the number of children to render dots
  const childrenCount = React.Children.count(children);

  return (
    <View style={[styles.container, style]}>
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={styles.headerRight}>
            {onSeeAll ? (
              <Pressable onPress={onSeeAll} style={styles.seeAllBtn}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                <ChevronForwardIcon size={14} color={colors.primary} />
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
        snapToInterval={itemWidth + 10}
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      <View style={styles.navRow}>
        {!hideArrows && (
        <Pressable
          onPress={scrollLeft}
          style={[styles.arrowBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
        >
          <ChevronBackIcon size={16} color={colors.textSecondary} />
        </Pressable>
        )}
        
        {childrenCount > 1 && (
          <View style={styles.dotsContainer}>
            {Array.from({ length: childrenCount }).map((_, i) => (
              <Pressable key={i} onPress={() => scrollToDot(i)} style={styles.dotHitSlop}>
                <View style={[
                  styles.dot, 
                  { backgroundColor: i === activeIndex ? colors.text : colors.textTertiary },
                  i === activeIndex && styles.dotActive
                ]} />
              </Pressable>
            ))}
          </View>
        )}

        {!hideArrows && (
        <Pressable
          onPress={scrollRight}
          style={[styles.arrowBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
        >
          <ChevronForwardIcon size={16} color={colors.textSecondary} />
        </Pressable>
        )}
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
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
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
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotHitSlop: {
    padding: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.5,
  },
  dotActive: {
    width: 20,
    opacity: 1,
  },
});
