import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonBlockProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonBlockProps) {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const bg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: bg },
        animStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }, style]}>
      <SkeletonBlock width={40} height={40} borderRadius={12} />
      <View style={styles.cardBody}>
        <SkeletonBlock width={140} height={14} />
        <SkeletonBlock width="90%" height={10} style={{ marginTop: 8 }} />
        <SkeletonBlock width="60%" height={10} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function SkeletonRow({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.row, style]}>
      <SkeletonBlock width={36} height={36} borderRadius={18} />
      <View style={styles.rowBody}>
        <SkeletonBlock width={120} height={12} />
        <SkeletonBlock width="80%" height={10} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function SkeletonStat({ style }: { style?: ViewStyle }) {
  const { isDark } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }, style]}>
      <SkeletonBlock width={50} height={28} borderRadius={6} />
      <SkeletonBlock width={80} height={10} style={{ marginTop: 8 }} />
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View style={styles.dashboardWrap}>
      <View style={styles.statsRow}>
        <SkeletonStat style={styles.statFlex} />
        <SkeletonStat style={styles.statFlex} />
        <SkeletonStat style={styles.statFlex} />
      </View>
      <SkeletonCard style={{ marginTop: 16 }} />
      <SkeletonCard style={{ marginTop: 12 }} />
      <SkeletonCard style={{ marginTop: 12 }} />
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.listWrap}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={{ marginTop: i > 0 ? 12 : 0 }} />
      ))}
    </View>
  );
}

export function BlogSkeleton() {
  const { isDark } = useTheme();
  return (
    <View style={styles.listWrap}>
      {[0, 1, 2].map(i => (
        <View key={i} style={[styles.blogCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }, i > 0 && { marginTop: 12 }]}>
          <SkeletonBlock width="100%" height={140} borderRadius={12} />
          <View style={{ padding: 14 }}>
            <SkeletonBlock width="70%" height={16} />
            <SkeletonBlock width="100%" height={10} style={{ marginTop: 10 }} />
            <SkeletonBlock width="85%" height={10} style={{ marginTop: 6 }} />
            <View style={styles.blogMeta}>
              <SkeletonBlock width={60} height={10} />
              <SkeletonBlock width={80} height={10} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function AnalyticsSkeleton() {
  return (
    <View style={styles.dashboardWrap}>
      <View style={styles.statsRow}>
        <SkeletonStat style={styles.statFlex} />
        <SkeletonStat style={styles.statFlex} />
      </View>
      <View style={[styles.statsRow, { marginTop: 10 }]}>
        <SkeletonStat style={styles.statFlex} />
        <SkeletonStat style={styles.statFlex} />
      </View>
      <SkeletonBlock width="100%" height={180} borderRadius={16} style={{ marginTop: 20 }} />
      <SkeletonBlock width="100%" height={140} borderRadius={16} style={{ marginTop: 16 }} />
    </View>
  );
}

export function NetworkSkeleton() {
  return (
    <View style={styles.listWrap}>
      {[0, 1, 2, 3].map(i => (
        <SkeletonRow key={i} style={i > 0 ? { marginTop: 14 } : undefined} />
      ))}
    </View>
  );
}

export function DevConsoleSkeleton() {
  return (
    <View style={styles.dashboardWrap}>
      <View style={styles.statsRow}>
        <SkeletonStat style={styles.statFlex} />
        <SkeletonStat style={styles.statFlex} />
      </View>
      <SkeletonCard style={{ marginTop: 16 }} />
      <SkeletonCard style={{ marginTop: 12 }} />
    </View>
  );
}

export { SkeletonBlock };

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  rowBody: {
    flex: 1,
  },
  stat: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statFlex: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dashboardWrap: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  listWrap: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  blogCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
