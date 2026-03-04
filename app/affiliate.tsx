import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { SkeletonBlock, SkeletonStat } from '@/components/ui/SkeletonLoader';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getApiUrl, queryClient } from '@/lib/query-client';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TIER_COLORS: Record<string, string> = {
  base: '#9CA3AF',
  silver: '#C0C0C0',
  gold: '#F59E0B',
  platinum: '#A78BFA',
  diamond: '#22D3EE',
};

const TIER_THRESHOLDS = [
  { name: 'Base', min: 0, rate: '10%', color: '#9CA3AF' },
  { name: 'Silver', min: 5, rate: '12.5%', color: '#C0C0C0' },
  { name: 'Gold', min: 15, rate: '15%', color: '#F59E0B' },
  { name: 'Platinum', min: 30, rate: '17.5%', color: '#A78BFA' },
  { name: 'Diamond', min: 50, rate: '20%', color: '#22D3EE' },
];

function AnimatedButton({ onPress, style, children }: { onPress: () => void; style: any; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[style, animStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function AffiliateScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const { data, isLoading } = useQuery({
    queryKey: ['/api/affiliate/dashboard'],
    queryFn: async () => {
      const url = new URL('/api/affiliate/dashboard', getApiUrl());
      const res = await fetch(url.toString(), { credentials: 'include' });
      return res.json();
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async () => {
      const url = new URL('/api/affiliate/request-payout', getApiUrl());
      const res = await fetch(url.toString(), { method: 'POST', credentials: 'include' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard'] });
    },
  });

  const handleCopyLink = async () => {
    if (!data?.referralLink) return;
    await Clipboard.setStringAsync(data.referralLink);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShare = async () => {
    if (!data?.referralLink) return;
    try {
      await Share.share({
        message: `Join me on TrustHome — part of the Trust Layer ecosystem!\n${data.referralLink}`,
      });
    } catch {}
  };

  const tierColor = TIER_COLORS[data?.tier || 'base'] || '#9CA3AF';
  const stats = data?.stats || {};
  const pendingNum = parseFloat(stats.pendingEarnings || '0');
  const canPayout = pendingNum >= 10;

  const totalReferrals = parseInt(stats.totalReferrals || '0', 10);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Affiliate Program" showBack />
        <View style={styles.skeletonWrap}>
          <View style={{ alignItems: 'center', marginBottom: 16, marginTop: 8 }}>
            <SkeletonBlock width={56} height={56} borderRadius={16} />
            <SkeletonBlock width={120} height={18} borderRadius={6} style={{ marginTop: 12 }} />
            <SkeletonBlock width={180} height={28} borderRadius={8} style={{ marginTop: 6 }} />
            <SkeletonBlock width={220} height={12} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.statsRow}>
            <SkeletonStat style={{ flex: 1 }} />
            <SkeletonStat style={{ flex: 1 }} />
          </View>
          <View style={[styles.statsRow, { marginTop: 8 }]}>
            <SkeletonStat style={{ flex: 1 }} />
            <SkeletonStat style={{ flex: 1 }} />
          </View>
          <SkeletonBlock width="100%" height={100} borderRadius={16} style={{ marginTop: 12 }} />
          <SkeletonBlock width="100%" height={200} borderRadius={16} style={{ marginTop: 12 }} />
        </View>
      </View>
    );
  }

  if (data?.error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Affiliate Program" showBack />
        <View style={styles.loadingWrap}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Sign in to access the affiliate program</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Share & Earn" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isWeb ? 74 : insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[tierColor + '20', tierColor + '08', 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.heroOrbWrap}>
              <LinearGradient
                colors={[tierColor + '30', tierColor + '10', 'transparent']}
                style={styles.heroOrb}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={[styles.tierBadge, { backgroundColor: tierColor + '20', borderColor: tierColor + '40' }]}>
                <Ionicons name="diamond" size={28} color={tierColor} />
              </View>
            </View>
            <Text style={[styles.tierName, { color: tierColor }]}>
              {(data?.tier || 'base').charAt(0).toUpperCase() + (data?.tier || 'base').slice(1)} Tier
            </Text>
            <Text style={[styles.commRate, { color: colors.text }]}>
              {((data?.commissionRate || 0.1) * 100).toFixed(1)}% Commission
            </Text>
            <Text style={[styles.heroSub, { color: colors.textTertiary }]}>
              Earn SIG across all 33 Trust Layer apps with one link
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <View style={styles.statsRow}>
            <StatCard label="Total Referrals" value={String(stats.totalReferrals || 0)} color="#22d3ee" isDark={isDark} />
            <StatCard label="Converted" value={String(stats.convertedReferrals || 0)} color="#34d399" isDark={isDark} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Pending" value={`${stats.pendingEarnings || '0.00'} SIG`} color="#f59e0b" isDark={isDark} />
            <StatCard label="Paid" value={`${stats.paidEarnings || '0.00'} SIG`} color="#a78bfa" isDark={isDark} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <View style={[styles.linkCard, {
            backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.72)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            shadowColor: isDark ? 'rgba(34,211,238,0.08)' : 'rgba(0,0,0,0.06)',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 16,
            elevation: 4,
          }]}>
            <Text style={[styles.linkLabel, { color: colors.textTertiary }]}>YOUR REFERRAL LINK</Text>
            <Text style={[styles.linkText, { color: colors.text }]} numberOfLines={1}>{data?.referralLink || ''}</Text>
            <View style={styles.linkActions}>
              <AnimatedButton onPress={handleCopyLink} style={[styles.linkBtn, { backgroundColor: '#22d3ee20' }]}>
                <Ionicons name="copy-outline" size={16} color="#22d3ee" />
                <Text style={{ color: '#22d3ee', fontSize: 13, fontWeight: '600' as const }}>Copy</Text>
              </AnimatedButton>
              <AnimatedButton onPress={handleShare} style={[styles.linkBtn, { backgroundColor: '#a78bfa20' }]}>
                <Ionicons name="share-outline" size={16} color="#a78bfa" />
                <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600' as const }}>Share</Text>
              </AnimatedButton>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(320)}>
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.72)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="trending-up-outline" size={14} color="#f59e0b" />
              <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>COMMISSION TIERS</Text>
            </View>
            {TIER_THRESHOLDS.map((t, idx) => {
              const isActive = (data?.tier || 'base').toLowerCase() === t.name.toLowerCase();
              const nextTier = idx < TIER_THRESHOLDS.length - 1 ? TIER_THRESHOLDS[idx + 1] : null;
              const progress = isActive && nextTier
                ? Math.min(1, (totalReferrals - t.min) / (nextTier.min - t.min))
                : isActive ? 1 : 0;
              return (
                <View key={t.name}>
                  <View style={[styles.tierRow, isActive && { backgroundColor: t.color + '08' }]}>
                    <View style={[styles.tierDot, { backgroundColor: t.color }]} />
                    <Text style={[styles.tierRowName, { color: isActive ? t.color : colors.text }]}>{t.name}</Text>
                    <Text style={[styles.tierRowReq, { color: colors.textTertiary }]}>{t.min}+ referrals</Text>
                    <Text style={[styles.tierRowRate, { color: isActive ? t.color : colors.textSecondary }]}>{t.rate}</Text>
                    {isActive && <Ionicons name="checkmark-circle" size={14} color={t.color} style={{ marginLeft: 4 }} />}
                  </View>
                  {isActive && (
                    <View style={styles.tierProgressWrap}>
                      <View style={[styles.tierProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                        <View style={[styles.tierProgressFill, { width: `${Math.max(5, progress * 100)}%`, backgroundColor: t.color }]} />
                      </View>
                      {nextTier && (
                        <Text style={[styles.tierProgressLabel, { color: colors.textTertiary }]}>
                          {totalReferrals}/{nextTier.min} to {nextTier.name}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>

        {canPayout && (
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Pressable
              onPress={() => payoutMutation.mutate()}
              disabled={payoutMutation.isPending}
              style={({ pressed }) => [styles.payoutBtn, {
                opacity: pressed ? 0.8 : 1,
                shadowColor: 'rgba(6,182,212,0.3)',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 1,
                shadowRadius: 20,
                elevation: 8,
              }]}
            >
              <LinearGradient
                colors={['#22d3ee', '#06b6d4']}
                style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              {payoutMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="wallet-outline" size={18} color="#fff" />
                  <Text style={styles.payoutBtnText}>Request Payout ({stats.pendingEarnings} SIG)</Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        )}

        {(data?.referrals?.length || 0) > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(480)}>
            <View style={[styles.section, { backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.72)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name="people-outline" size={14} color="#22d3ee" />
                <Text style={[styles.sectionTitle, { color: '#22d3ee' }]}>RECENT REFERRALS</Text>
              </View>
              {data.referrals.slice(0, 10).map((ref: any) => (
                <View key={ref.id} style={styles.refRow}>
                  <View style={[styles.statusDot, { backgroundColor: ref.status === 'converted' ? '#34d399' : '#f59e0b' }]} />
                  <Text style={[styles.refPlatform, { color: colors.text }]}>{ref.platform}</Text>
                  <Text style={[styles.refDate, { color: colors.textTertiary }]}>{new Date(ref.createdAt).toLocaleDateString()}</Text>
                  <View style={[styles.refStatusPill, { backgroundColor: ref.status === 'converted' ? '#34d39920' : '#f59e0b20' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '600' as const, color: ref.status === 'converted' ? '#34d399' : '#f59e0b' }}>{ref.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <Footer />
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, color, isDark }: { label: string; value: string; color: string; isDark: boolean }) {
  return (
    <View style={[styles.statCard, {
      backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.72)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    }]}>
      <View style={[styles.statAccentLine, { backgroundColor: color + '4D' }]} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center' as const, width: '100%' },
  loadingWrap: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, gap: 12 },
  skeletonWrap: { flex: 1, paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center' as const, width: '100%' },
  errorText: { fontSize: 14, marginTop: 8 },
  heroSection: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 24,
    marginBottom: 16,
    marginTop: 8,
    alignItems: 'center' as const,
  },
  heroOrbWrap: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 8,
  },
  heroOrb: {
    position: 'absolute' as const,
    width: 96,
    height: 96,
    borderRadius: 48,
    top: -20,
  },
  tierBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  tierName: { fontSize: 18, fontWeight: '700' as const, letterSpacing: 0.5 },
  commRate: { fontSize: 28, fontWeight: '800' as const, marginTop: 2 },
  heroSub: { fontSize: 12, marginTop: 6, textAlign: 'center' as const },
  statsRow: { flexDirection: 'row' as const, gap: 8, marginBottom: 8 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  statAccentLine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  statValue: { fontSize: 20, fontWeight: '700' as const },
  statLabel: { fontSize: 10, marginTop: 2 },
  linkCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  linkLabel: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 1, marginBottom: 6 },
  linkText: { fontSize: 13, fontWeight: '500' as const, marginBottom: 12 },
  linkActions: { flexDirection: 'row' as const, gap: 8 },
  linkBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    minHeight: 44,
    borderRadius: 10,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden' as const,
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
  tierRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierRowName: { fontSize: 13, fontWeight: '600' as const, width: 70 },
  tierRowReq: { fontSize: 11, flex: 1 },
  tierRowRate: { fontSize: 13, fontWeight: '700' as const },
  tierProgressWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  tierProgressBg: {
    height: 4,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  tierProgressFill: {
    height: 4,
    borderRadius: 4,
  },
  tierProgressLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  payoutBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    minHeight: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden' as const,
  },
  payoutBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#fff' },
  refRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  refPlatform: { fontSize: 13, fontWeight: '500' as const, flex: 1 },
  refDate: { fontSize: 11 },
  refStatusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
});
