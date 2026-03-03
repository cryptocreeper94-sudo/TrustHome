import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { SkeletonBlock } from '@/components/ui/SkeletonLoader';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedVerifyButton({ onPress, icon, iconColor, label, labelColor, bgColor, style }: {
  onPress: () => void;
  icon: string;
  iconColor: string;
  label: string;
  labelColor?: string;
  bgColor: string;
  style?: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.verifyBtn, { backgroundColor: bgColor }, style, animStyle]}
    >
      <Ionicons name={icon as any} size={14} color={iconColor} />
      <Text style={[styles.verifyBtnText, labelColor ? { color: labelColor } : undefined]}>{label}</Text>
    </AnimatedPressable>
  );
}

function HallmarkSkeleton() {
  const { isDark } = useTheme();
  return (
    <View style={styles.skeletonWrap}>
      <View style={[styles.skeletonHero, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
        <SkeletonBlock width={80} height={80} borderRadius={20} />
        <SkeletonBlock width={100} height={12} style={{ marginTop: 12 }} />
        <SkeletonBlock width={180} height={32} borderRadius={8} style={{ marginTop: 8 }} />
        <SkeletonBlock width={140} height={20} borderRadius={12} style={{ marginTop: 10 }} />
      </View>
      {[0, 1, 2].map(i => (
        <View key={i} style={[styles.skeletonSection, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
          <SkeletonBlock width={140} height={14} style={{ marginBottom: 12 }} />
          <SkeletonBlock width="100%" height={12} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="90%" height={12} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="75%" height={12} />
        </View>
      ))}
    </View>
  );
}

function DetailRow({ label, value, colors, mono, highlight, isLast }: { label: string; value?: string; colors: any; mono?: boolean; highlight?: boolean; isLast?: boolean }) {
  const { isDark } = useTheme();
  if (!value) return null;
  return (
    <View style={[styles.detailRow, !isLast && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
      <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          { color: highlight ? '#22d3ee' : colors.text },
          mono && styles.mono,
        ]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

export default function HallmarkDetailScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { id } = useLocalSearchParams<{ id?: string }>();
  const hallmarkId = id || 'TR-00000001';

  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(1.0, { duration: 1800 }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const { data, isLoading } = useQuery({
    queryKey: ['/api/hallmark', hallmarkId, 'verify'],
    queryFn: async () => {
      const url = new URL(`/api/hallmark/${hallmarkId}/verify`, getApiUrl());
      const res = await fetch(url.toString(), { credentials: 'include' });
      return res.json();
    },
  });

  const genesisQuery = useQuery({
    queryKey: ['/api/hallmark/genesis'],
    queryFn: async () => {
      const url = new URL('/api/hallmark/genesis', getApiUrl());
      const res = await fetch(url.toString(), { credentials: 'include' });
      return res.json();
    },
    enabled: hallmarkId === 'TR-00000001',
  });

  const hallmark = hallmarkId === 'TR-00000001' && genesisQuery.data?.hallmark
    ? genesisQuery.data.hallmark
    : data?.hallmark;
  const metadata = hallmark?.metadata || {};
  const isGenesis = hallmark?.releaseType === 'genesis';

  const sectionBg = isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.72)';
  const sectionBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const sectionShadow = isWeb ? { boxShadow: '0px 4px 20px rgba(6,182,212,0.06)' } : {};

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Hallmark" showBack />
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: isWeb ? 74 : insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          <HallmarkSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Hallmark" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isWeb ? 74 : insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={isDark
                ? ['rgba(6,182,212,0.12)', 'rgba(139,92,246,0.08)', 'transparent']
                : ['rgba(6,182,212,0.06)', 'rgba(139,92,246,0.04)', 'transparent']
              }
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.shieldOuter}>
              <Animated.View style={[styles.shieldGlow, glowStyle]} />
              <View style={styles.shieldWrap}>
                <LinearGradient
                  colors={['rgba(6,182,212,0.3)', 'rgba(139,92,246,0.3)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name="shield-checkmark" size={48} color="#22d3ee" />
              </View>
            </View>
            <Text style={[styles.badgeLabel, { color: colors.textTertiary }]}>
              {isGenesis ? 'Genesis Hallmark' : 'Hallmark'}
            </Text>
            <Text style={[styles.hallmarkIdText, { color: '#22d3ee' }]}>
              {hallmark?.thId || hallmarkId}
            </Text>
            {data?.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#34d399" />
                <Text style={styles.verifiedText}>Verified on Trust Layer</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {hallmark && (
          <>
            <Animated.View entering={FadeInDown.duration(400).delay(160)}>
              <View style={[styles.section, { backgroundColor: sectionBg, borderColor: sectionBorder }, sectionShadow as any]}>
                <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="information-circle-outline" size={16} color="#22d3ee" />
                  <Text style={[styles.sectionTitle, { color: '#22d3ee' }]}>APPLICATION INFO</Text>
                </View>
                <DetailRow label="App Name" value={hallmark.appName} colors={colors} />
                <DetailRow label="Product" value={hallmark.productName} colors={colors} />
                <DetailRow label="Release Type" value={hallmark.releaseType} colors={colors} />
                <DetailRow label="Created" value={new Date(hallmark.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} colors={colors} isLast />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(240)}>
              <View style={[styles.section, { backgroundColor: sectionBg, borderColor: sectionBorder }, sectionShadow as any]}>
                <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="cube-outline" size={16} color="#a78bfa" />
                  <Text style={[styles.sectionTitle, { color: '#a78bfa' }]}>BLOCKCHAIN RECORD</Text>
                </View>
                <DetailRow label="Data Hash" value={hallmark.dataHash} colors={colors} mono />
                <DetailRow label="Tx Hash" value={hallmark.txHash} colors={colors} mono />
                <DetailRow label="Block Height" value={hallmark.blockHeight} colors={colors} isLast />
              </View>
            </Animated.View>

            {isGenesis && metadata && (
              <Animated.View entering={FadeInDown.duration(400).delay(320)}>
                <View style={[styles.section, { backgroundColor: sectionBg, borderColor: sectionBorder }, sectionShadow as any]}>
                  <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <Ionicons name="globe-outline" size={16} color="#34d399" />
                    <Text style={[styles.sectionTitle, { color: '#34d399' }]}>ECOSYSTEM DETAILS</Text>
                  </View>
                  <DetailRow label="Ecosystem" value={metadata.ecosystem} colors={colors} />
                  <DetailRow label="Operator" value={metadata.operator} colors={colors} />
                  <DetailRow label="Chain" value={metadata.chain} colors={colors} />
                  <DetailRow label="Consensus" value={metadata.consensus} colors={colors} />
                  <DetailRow label="Domain" value={metadata.domain} colors={colors} />
                  <DetailRow label="Native Asset" value={metadata.nativeAsset} colors={colors} />
                  <DetailRow label="Utility Token" value={metadata.utilityToken} colors={colors} />
                  <DetailRow label="Launch Date" value="August 23, 2026" colors={colors} />
                  <DetailRow label="Parent App" value={metadata.parentApp} colors={colors} />
                  <DetailRow label="Parent Genesis" value={metadata.parentGenesis} colors={colors} highlight isLast />
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.duration(400).delay(400)}>
              <View style={[styles.section, { backgroundColor: sectionBg, borderColor: sectionBorder }, sectionShadow as any]}>
                <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="checkmark-done-outline" size={16} color="#f59e0b" />
                  <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>VERIFICATION</Text>
                </View>
                <AnimatedVerifyButton
                  onPress={() => Linking.openURL(`https://trusthome.tlid.io/api/hallmark/${hallmark.thId}/verify`)}
                  icon="open-outline"
                  iconColor="#22d3ee"
                  label="Verify on Trust Layer"
                  bgColor={isDark ? 'rgba(34,211,238,0.1)' : 'rgba(34,211,238,0.08)'}
                />
                {isGenesis && (
                  <AnimatedVerifyButton
                    onPress={() => Linking.openURL('https://trusthub.tlid.io/api/hallmark/TH-00000001/verify')}
                    icon="link-outline"
                    iconColor="#a78bfa"
                    label="View Hub Genesis (TH-00000001)"
                    labelColor="#a78bfa"
                    bgColor={isDark ? 'rgba(167,139,250,0.1)' : 'rgba(167,139,250,0.08)'}
                    style={{ marginTop: 8 }}
                  />
                )}
              </View>
            </Animated.View>
          </>
        )}

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center' as const, width: '100%' },
  skeletonWrap: { paddingTop: 8 },
  skeletonHero: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center' as const,
  },
  skeletonSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  heroSection: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 24,
    marginBottom: 16,
    marginTop: 8,
    alignItems: 'center' as const,
  },
  shieldOuter: {
    width: 96,
    height: 96,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  shieldGlow: {
    position: 'absolute' as const,
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(6,182,212,0.15)',
  },
  shieldWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  badgeLabel: { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4 },
  hallmarkIdText: { fontSize: 32, fontWeight: '800' as const, letterSpacing: 1 },
  verifiedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(52,211,153,0.1)',
  },
  verifiedText: { fontSize: 11, color: '#34d399', fontWeight: '600' as const },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 12, fontWeight: '600' as const, maxWidth: '55%' as any, textAlign: 'right' as const },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10 },
  verifyBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center' as const,
  },
  verifyBtnText: { fontSize: 13, fontWeight: '600' as const, color: '#22d3ee' },
});
